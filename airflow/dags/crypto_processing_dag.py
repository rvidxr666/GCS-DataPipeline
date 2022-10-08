import os
import logging

from airflow import DAG
from airflow.utils.dates import days_ago
from airflow.operators.bash import BashOperator
from airflow.operators.python import PythonOperator
from datetime import datetime

from google.cloud import storage
from airflow.providers.google.cloud.operators.bigquery import BigQueryCreateExternalTableOperator

PROJECT_ID = os.environ.get("GCP_PROJECT_ID")
LANDING_BUCKET = os.environ.get("GCP_LANDING_BUCKET")
PREPARED_BUCKET = os.environ.get("GCP_PREPARED_BUCKET")

# dataset_file = "yellow_tripdata_2022-01.parquet"
# dataset_url = f"https://d37ci6vzurychx.cloudfront.net/trip-data/{dataset_file}"
# path_to_local_home = os.environ.get("AIRFLOW_HOME", "/opt/airflow/")
# parquet_file = dataset_file.replace('.csv', '.parquet')
# BIGQUERY_DATASET = os.environ.get("BIGQUERY_DATASET", 'trips_data_all')



default_args = {
    "owner": "airflow",
    "depends_on_past": False,
    'start_date': datetime(2015, 12, 1),
    "retries": 1
}

# NOTE: DAG declaration - using a Context Manager (an implicit way)
with DAG(
    dag_id="data_processing_dag",
    schedule_interval="50 * * * *",
    default_args=default_args,
    catchup=False,
    max_active_runs=1,
    tags=['dtc-de'],
) as dag:

    process_crypto_job = BashOperator(
        task_id="run_dataprocessing_job",
        bash_command=f"python /opt/airflow/jobs/processCrypto.py {PROJECT_ID} gs://{LANDING_BUCKET} gs://{PREPARED_BUCKET}"
    )

