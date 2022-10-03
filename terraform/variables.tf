variable "project-id" {
  type = string
}

variable "credentials-location" {
  type = string
}

variable "job-name" {
  type = string
}

variable "region" {
  type = string
}

variable "tables_directories" {
  type    = set(string)
  default = ["dates_coin", "dates_net", "hours_coin", "hours_net", "summarize_net"]
}

variable "schema" {
  default = <<EOF
[
  {
    "name": "Date",
    "type": "DATE",
    "mode": "NULLABLE",
    "description": "The Permalink"
  },
  {
    "name": "Hour",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "Hour"
  }, 
  {
    "name": "Network",
    "type": "STRING",
    "mode": "NULLABLE",
    "description": "Network"
  }, 
  {
    "name": "NetworkCount",
    "type": "FLOAT",
    "mode": "NULLABLE",
    "description": "Count"
  }, 
  {
    "name": "Name",
    "type": "STRING",
    "mode": "NULLABLE",
    "description": "Name"
  }, 
  {
    "name": "Price",
    "type": "FLOAT",
    "mode": "NULLABLE",
    "description": "Price"
  }, 
  {
    "name": "PercentageChange",
    "type": "FLOAT",
    "mode": "NULLABLE",
    "description": "PercentageChange"
  }, 
  {
    "name": "PriceDiff",
    "type": "FLOAT",
    "mode": "NULLABLE",
    "description": "PriceDiff"
  }
]
EOF 
}
