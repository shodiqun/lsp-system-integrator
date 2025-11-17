variable "kubeconfig" {
  description = "Path to the kubeconfig file pointing at the Minikube cluster."
  type        = string
  default     = "~/.kube/config"
}

variable "namespace" {
  description = "Namespace where ecommerce resources will run."
  type        = string
  default     = "ecommerce"
}

variable "postgres_name" {
  description = "Name used for PostgreSQL StatefulSet and related resources."
  type        = string
  default     = "postgres"
}

variable "postgres_image" {
  description = "PostgreSQL container image."
  type        = string
  default     = "postgres:16-alpine"
}

variable "postgres_user" {
  description = "Default PostgreSQL superuser."
  type        = string
  default     = "ecommerce"
}

variable "postgres_database" {
  description = "Default PostgreSQL database name."
  type        = string
  default     = "abandoned_cart"
}

variable "postgres_storage" {
  description = "Persistent volume size requested by PostgreSQL."
  type        = string
  default     = "5Gi"
}

variable "storage_class" {
  description = "StorageClass to use for the StatefulSet volume claim."
  type        = string
  default     = "standard"
}

variable "postgres_replicas" {
  description = "Number of PostgreSQL replicas."
  type        = number
  default     = 1
}
