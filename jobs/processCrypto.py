import pandas as pd
import argparse
import sys

import pyspark
from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.functions import when, date_trunc, col, to_timestamp
from pyspark.sql.types import StructType, StructField, StringType, IntegerType, DateType, DoubleType, FloatType

import datetime as dt

PROJECT = ""
SOURCE_BUCKET = ""
TARGET_BUCKET = ""

conf = pyspark.SparkConf().setAll([
                                   ("fs.gs.impl", "com.google.cloud.hadoop.fs.gcs.GoogleHadoopFileSystem"),
                                   ("fs.AbstractFileSystem.gs.impl", "com.google.cloud.hadoop.fs.gcs.GoogleHadoopFS"),
                                   ("fs.gs.project.id",f"{PROJECT}"),
                                   ("fs.gs.auth.service.account.enable", "true"),
                                   ("fs.gs.auth.service.account.json.keyfile", "/home/maksi/.google/credentials/google_credentials.json")                                   
                                ])


spark = SparkSession.builder \
    .config(conf=conf)\
    .master("local[*]") \
    .appName("test") \
    .getOrCreate()


schema_week = StructType([ \
                StructField("Date",DateType(),True), \
                StructField("Network",StringType(),True), \
                StructField("Price",FloatType(),True), \
                StructField("PercentageChange", FloatType(), True), \
                StructField("PriceDiff", FloatType(), True)
            ])


schema_day = StructType([ \
                StructField("Date",DateType(),True), \
                StructField("Hour",IntegerType(),True), \
                StructField("Network",StringType(),True), \
                StructField("Price",FloatType(),True), \
                StructField("PercentageChange", FloatType(), True), \
                StructField("PriceDiff", FloatType(), True)
            ])



def most_popular_network(df):
    df.registerTempTable("crypto_prices")   

    # Per week 
    return spark.sql(
    '''
        SELECT Network, ROUND(AVG(NetworkCount)) as NetworkCount
        FROM 
            (SELECT Date, Hour, Network, COUNT(*) as NetworkCount
            FROM crypto_prices
            GROUP BY 1, 2, 3
            ORDER BY 4 DESC)
        GROUP BY 1 
        ORDER BY 2 DESC
    '''
    )


def list_of_last_week_dates(days = 9):
    date_today = dt.date.today()
    last_week_days = [date_today - dt.timedelta(days=x) for x in range(days)]
    print(last_week_days)
    return last_week_days


def processing_dates(df):
    df.rename(columns = {"Time":"Date"}, inplace=True)
    df["Hour"] = df.Date.apply(lambda x: x.hour)
    df.Date = df.Date.apply(lambda x: x.date())
    return df


def extract_data_for_last_week(sparkDf, last_week_days = list_of_last_week_dates()):
    df = sparkDf.toPandas()
    df = processing_dates(df)
    df = df[df.Date.isin(last_week_days)]
    return df


def count_price_change(grouped_df, calculation_var="Network"):
    counted_df = pd.DataFrame(columns=grouped_df.columns)
    unique_networks = grouped_df[calculation_var].unique()

    for net in unique_networks:
        net_df = grouped_df[grouped_df[calculation_var] == net].reset_index(drop=True)
        net_df["PercentageChange"] = None
        net_df["PriceDiff"] = None

        for tup in net_df.itertuples():
            curr_tup_index = tup.Index
            # print(curr_tup_index)
            if curr_tup_index == 0:
                net_df.loc[curr_tup_index, "PercentageChange"] = None
                net_df.loc[curr_tup_index,"PriceDiff"] = None
                continue
            
            prev_tup_price = net_df.loc[curr_tup_index - 1, "Price"]
            percentage = (tup.Price / prev_tup_price - 1) * 100
            net_df.loc[curr_tup_index, "PercentageChange"] = percentage
            net_df.loc[curr_tup_index, "PriceDiff"] = tup.Price - prev_tup_price
            # print(prev_tup_price)
        counted_df = pd.concat([counted_df, net_df])
        # print(net_df)
    
    # Dataframe can be empty because of the lack of data for the current day
    if not counted_df.empty:
        counted_df.reset_index(drop=True, inplace=True)
        counted_df = counted_df.astype({"PercentageChange": float, "PriceDiff": float})

    return counted_df

def count_price_change_driver(df, group_by="Network"):
    # CHECK
    grouped_df_by_date = df.groupby(["Date", group_by])\
                    .mean("Price")["Price"]\
                    .reset_index()

    grouped_df_by_hour = df.groupby(["Date", "Hour", group_by])\
                    .mean("Price")["Price"]\
                    .reset_index()

    grouped_df_last_hour = grouped_df_by_hour[grouped_df_by_hour["Date"] == dt.date.today()]\
                                    .reset_index(drop=True)

    last_hour_price_change = count_price_change(grouped_df_last_hour, calculation_var=group_by)
    last_week_price_change = count_price_change(grouped_df_by_date, calculation_var=group_by)
    return last_hour_price_change, last_week_price_change


def count_networks_weekly(df):
    df_for_sum_net_spark = spark.createDataFrame(df)
    df_grouped = most_popular_network(df_for_sum_net_spark)
    return df_grouped


def write_to_parquet(df, destination):
    df.write.option("header",True) \
        .mode("overwrite") \
        .parquet(destination)


def process_json_files():
    cryptoDF = spark.read.json(f"/mnt/c/Random Projects/gcp-pipeline/data-landing/*")\
        .withColumn("Time", to_timestamp(col("Time"),"dd-MM-yyyy HH:mm:ss"))\
        .withColumn("Time", date_trunc("hour", "Time"))

    last_week_df_for_diff = extract_data_for_last_week(cryptoDF)
    last_hour_price_change, last_week_price_change = count_price_change_driver(last_week_df_for_diff)
    last_hour_price_change_coin, last_week_price_change_coin = count_price_change_driver(last_week_df_for_diff, group_by="Name")

    last_week_list_for_sum = list_of_last_week_dates(days = 8)
    last_week_df_for_sum = extract_data_for_last_week(cryptoDF, last_week_list_for_sum)
    df_for_sum_net_spark = count_networks_weekly(last_week_df_for_sum)

    last_hours_price_change_spark = spark.createDataFrame(last_hour_price_change, schema=schema_day).repartition(4)
    last_days_price_change_spark = spark.createDataFrame(last_week_price_change, schema=schema_week).repartition(4)

    last_hour_price_change_coin_spark = spark.createDataFrame(last_hour_price_change_coin).repartition(4)
    last_week_price_change_coin_spark = spark.createDataFrame(last_week_price_change_coin).repartition(4)

    write_to_parquet(df_for_sum_net_spark, f"{TARGET_BUCKET}/summarize_net")
    write_to_parquet(last_days_price_change_spark, f"{TARGET_BUCKET}/days_net")
    write_to_parquet(last_hours_price_change_spark, f"{TARGET_BUCKET}/hours_net")

    write_to_parquet(last_week_price_change_coin_spark, f"{TARGET_BUCKET}/days_coin")
    write_to_parquet(last_hour_price_change_coin_spark, f"{TARGET_BUCKET}/hours_coin")



def arg_parser():
    parser = argparse.ArgumentParser(description="Args to run the job")

    parser.add_argument("--source-bucket", required=True)
    parser.add_argument("--target-bucket", required=True)
    parser.add_argument("--project", required=True)

    args = parser.parse_args()

    global PROJECT
    PROJECT = args.project

    global SOURCE_BUCKET
    SOURCE_BUCKET = args.source_bucket

    global TARGET_BUCKET
    TARGET_BUCKET = args.target_bucket


if __name__ == "__main__":
    arg_parser()
    process_json_files()
