import pandas as pd

import pyspark
from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.functions import when, date_trunc, col, to_timestamp
from pyspark.sql.types import StructType, StructField, StringType, IntegerType, DateType, DoubleType, FloatType

import datetime as dt

spark = SparkSession.builder \
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



# def most_popular_network():   
#     # Per week 
#     return spark.sql(
#     '''
#         SELECT Network, ROUND(AVG(NetworkCount)) as NetworkCount
#         FROM
#             (SELECT Time, Network, COUNT(*) as NetworkCount
#             FROM crypto_prices
#             GROUP BY 1, 2
#             ORDER BY 3 DESC)
#         GROUP BY 1
#         ORDER BY 2 DESC
#     '''
#     )


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


def count_price_change(grouped_df):
    counted_df = pd.DataFrame(columns=grouped_df.columns)
    unique_networks = grouped_df.Network.unique()

    for net in unique_networks:
        net_df = grouped_df[grouped_df["Network"] == net].reset_index(drop=True)
        net_df["PercentageChange"] = None
        net_df["PriceDiff"] = None

        for tup in net_df.itertuples():
            curr_tup_index = tup.Index
            print(curr_tup_index)
            if curr_tup_index == 0:
                net_df.loc[curr_tup_index, "PercentageChange"] = None
                net_df.loc[curr_tup_index,"PriceDiff"] = None
                continue
            
            prev_tup_price = net_df.loc[curr_tup_index - 1, "Price"]
            percentage = (tup.Price / prev_tup_price - 1) * 100
            net_df.loc[curr_tup_index, "PercentageChange"] = percentage
            net_df.loc[curr_tup_index, "PriceDiff"] = tup.Price - prev_tup_price
            print(prev_tup_price)
        counted_df = pd.concat([counted_df, net_df])
        print(net_df)
    
    counted_df.reset_index(drop=True, inplace=True)
    counted_df = counted_df.astype({"PercentageChange": float, "PriceDiff": float})


    return counted_df


def count_price_change_driver(df):
    grouped_df_by_date = df.groupby(["Date", "Network"])\
                    .mean("Price")["Price"]\
                    .reset_index()

    grouped_df_by_hour = df.groupby(["Date", "Hour", "Network"])\
                    .mean("Price")["Price"]\
                    .reset_index()

    grouped_df_last_hour = grouped_df_by_hour[grouped_df_by_hour["Date"] == dt.date.today()]\
                                    .reset_index(drop=True)

    last_hour_price_change = count_price_change(grouped_df_last_hour)
    last_week_price_change = count_price_change(grouped_df_by_date)
    return last_hour_price_change, last_week_price_change


def count_networks_weekly(df):
    df_grouped = df.groupby(["Network"]).count()\
                        .reset_index()[["Network", "Price"]]\
                        .rename({"Price":"Count"})

    return df_grouped


def write_to_parquet(df, destination, partition_by):
    df.write.option("header",True) \
        .mode("overwrite") \
        .parquet(destination)


def process_json_files():
    cryptoDF = spark.read.json("/mnt/c/Random Projects/gcp-pipeline/data-landing/*")\
        .withColumn("Time", to_timestamp(col("Time"),"dd-MM-yyyy HH:mm:ss"))\
        .withColumn("Time", date_trunc("hour", "Time"))

    last_week_df_for_diff = extract_data_for_last_week(cryptoDF)
    last_hour_price_change, last_week_price_change = count_price_change_driver(last_week_df_for_diff)

    last_week_list_for_sum = list_of_last_week_dates(days = 8)
    last_week_df_for_sum = extract_data_for_last_week(cryptoDF, last_week_list_for_sum)
    df_for_sum_net = count_networks_weekly(last_week_df_for_sum)

    df_for_sum_net_spark = spark.createDataFrame(df_for_sum_net)
    last_hours_price_change_spark = spark.createDataFrame(last_hour_price_change, schema=schema_day)
    last_days_price_change_spark = spark.createDataFrame(last_week_price_change, schema=schema_week)

    write_to_parquet(df_for_sum_net_spark, "/mnt/c/Random Projects/gcp-pipeline/data-prepared/summarize", "Network")
    write_to_parquet(last_days_price_change_spark, "/mnt/c/Random Projects/gcp-pipeline/data-prepared/daily", "Network")
    write_to_parquet(last_hours_price_change_spark, "/mnt/c/Random Projects/gcp-pipeline/data-prepared/hourly", "Network")
    last_days_price_change_spark.show()


    test_df = spark.read.parquet("/mnt/c/Random Projects/gcp-pipeline/data-prepared/summarize/*")
    test_df.show()
    # df = cryptoDF.toPandas()

    # print(df.Network.unique())

    # cryptoDF.groupBy("Network").agg({"Price": "avg"}).sort()


if __name__ == "__main__":
    process_json_files()
