terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
    }
  }
}


provider "google" {
  project     = var.project-id
  credentials = var.credentials-location
}