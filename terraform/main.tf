resource "google_service_account" "job-invoker-account" {
  account_id   = "job-invoker-account"
  display_name = "Account for accessing images in the registry"
}

resource "google_project_iam_member" "gcpdiag-service-account-role" {
  project = var.project-id
  role    = "roles/editor"
  member  = "serviceAccount:${google_service_account.job-invoker-account.email}"
}


# resource "google_cloud_run_service" "java-injector" {
#     name     = "java-injector-terraform"
#     location = var.region
#     template {
#       spec {
#             containers {
#                 image = "gcr.io/marine-catfish-310009/java-injector/java-injector"
#             }
#       }
#     }
#     traffic {
#       percent         = 100
#       latest_revision = true
#     }
# }

resource "google_storage_bucket" "landing-bucket" {
  name          = "landing-bucket-terraform"
  location      = "EU"
  force_destroy = true

  lifecycle_rule {
    condition {
      age = 9
    }
    action {
      type = "Delete"
    }
  }
}


resource "google_storage_bucket" "prepared-bucket" {
  name          = "prepared-bucket-terraform"
  location      = "EU"
  force_destroy = true

  lifecycle_rule {
    condition {
      age = 9
    }
    action {
      type = "Delete"
    }
  }
}

resource "google_storage_bucket_object" "data_folder" {
  for_each = var.tables_directories
  source = "./sample_parquet/test-spark/spark.parquet"
  name     = "${each.value}/test.parquet"
  bucket   = google_storage_bucket.prepared-bucket.name
}


resource "google_bigquery_dataset" "pipeline-dataset" {
  dataset_id                  = "pipeline_dataset_terraform"
  friendly_name               = "pipeline_dataset_terraform"
  description                 = "Pipeline Dataset"
  location                    = "EU"
}


resource "google_bigquery_table" "external_data_table" {
  dataset_id = google_bigquery_dataset.pipeline-dataset.dataset_id
  deletion_protection = false
  for_each = var.tables_directories
  table_id   = each.value
  schema = var.schema

  external_data_configuration {
    autodetect    = true
    source_format = "PARQUET"

    source_uris = [
      "gs://${google_storage_bucket.prepared-bucket.name}/${each.value}/*.parquet",
    ]
  }
  depends_on = [
    google_storage_bucket_object.data_folder
  ]
}

resource "null_resource" "visulization-app" {

  provisioner "local-exec" {
    when    = create
    command = "docker-compose -f ../visualization_app/docker-compose.yaml up -d"
  }

  provisioner "local-exec" {
    when        = destroy
    command     = "docker-compose -f ../visualization_app/docker-compose.yaml down"
    working_dir = path.module
  }
  depends_on = [
    google_bigquery_table.external_data_table
  ]
}


resource "null_resource" "airflow-job" {

  provisioner "local-exec" {
    when    = create
    command = "docker-compose -f ../airflow/docker-compose.yaml up -d"
  }

  provisioner "local-exec" {
    when        = destroy
    command     = "docker-compose -f ../airflow/docker-compose.yaml down"
    working_dir = path.module
  }
  
  depends_on = [
    google_storage_bucket_object.data_folder,
    google_storage_bucket.landing-bucket
  ]

}


resource "null_resource" "java-injector-job" {
  triggers = {
    job-name = var.job-name
    region   = var.region
  }

  provisioner "local-exec" {
    when    = create
    command = "gcloud beta run jobs create ${var.job-name} --image=gcr.io/${var.project-id}/java-injector --region=${var.region} --set-env-vars=landing-bucket=${google_storage_bucket.landing-bucket.name},project-id=${var.project-id} --quiet"
  }

  provisioner "local-exec" {
    when        = destroy
    command     = "gcloud beta run jobs delete ${self.triggers.job-name} --region=${self.triggers.region} --quiet"
    working_dir = path.module
  }
}


resource "google_cloud_scheduler_job" "injector-trigger-job" {
  name        = "injector-trigger-job-terraform"
  description = "trigger java injector job"
  schedule    = "40 * * * *"
  time_zone   = "Europe/Warsaw"
  region      = var.region

  http_target {
    http_method = "POST"
    uri         = "https://europe-central2-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${var.project-id}/jobs/${var.job-name}:run"
    oauth_token {
      service_account_email = google_service_account.job-invoker-account.email
    }
  }

  depends_on = [
    null_resource.java-injector-job
  ]
}




# https://europe-central2-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/marine-catfish-310009/jobs/java-injector:run