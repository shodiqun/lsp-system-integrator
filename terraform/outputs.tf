output "namespace" {
  description = "Namespace managed by Terraform."
  value       = kubernetes_namespace.ecommerce.metadata[0].name
}

output "postgres_service" {
  description = "ClusterIP service name for PostgreSQL."
  value       = kubernetes_service.postgres.metadata[0].name
}

output "postgres_secret" {
  description = "Secret containing PostgreSQL credentials."
  value       = kubernetes_secret.postgres.metadata[0].name
}
