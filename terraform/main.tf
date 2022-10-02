resource "google_service_account" "job-invoker-account" {
  account_id   = "job-invoker-account"
  display_name = "Account for accessing images in the registry"
}

resource "google_project_iam_member" "gcpdiag-service-account-role" {
  project = var.project-id
  role    = "roles/run.invoker"
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


resource "null_resource" "java-injector-job" {
  triggers = {
    job-name = var.job-name
    region   = var.region
  }
  provisioner "local-exec" {
    when    = create
    command = "gcloud beta run jobs create ${var.job-name} --image=gcr.io/${var.project-id}/java-injector/java-injector --region=${var.region} --quiet"
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