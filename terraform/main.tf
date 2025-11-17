terraform {
  required_version = ">= 1.5.7"

  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.25"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
}

provider "kubernetes" {
  config_path = var.kubeconfig
}

resource "kubernetes_namespace" "ecommerce" {
  metadata {
    name = var.namespace
    labels = {
      "app.kubernetes.io/part-of" = var.namespace
      "platform.toko"             = "ecommerce"
    }
  }
}

resource "random_password" "postgres" {
  length  = 24
  special = true
}

resource "kubernetes_secret" "postgres" {
  metadata {
    name      = "${var.postgres_name}-credentials"
    namespace = kubernetes_namespace.ecommerce.metadata[0].name
    labels = {
      "app" = var.postgres_name
    }
  }

  data = {
    POSTGRES_PASSWORD = random_password.postgres.result
    POSTGRES_USER     = var.postgres_user
  }

  type = "Opaque"
}

resource "kubernetes_service" "postgres_headless" {
  metadata {
    name      = "${var.postgres_name}-headless"
    namespace = kubernetes_namespace.ecommerce.metadata[0].name
    labels = {
      "app" = var.postgres_name
    }
  }

  spec {
    selector = {
      "app" = var.postgres_name
    }

    port {
      name        = "postgres"
      port        = 5432
      target_port = 5432
    }

    cluster_ip = "None"
  }
}

resource "kubernetes_service" "postgres" {
  metadata {
    name      = var.postgres_name
    namespace = kubernetes_namespace.ecommerce.metadata[0].name
    labels = {
      "app" = var.postgres_name
    }
  }

  spec {
    selector = {
      "app" = var.postgres_name
    }

    port {
      name        = "postgres"
      port        = 5432
      target_port = 5432
    }
  }
}

resource "kubernetes_stateful_set" "postgres" {
  metadata {
    name      = var.postgres_name
    namespace = kubernetes_namespace.ecommerce.metadata[0].name
    labels = {
      "app" = var.postgres_name
    }
  }

  spec {
    service_name = kubernetes_service.postgres_headless.metadata[0].name
    replicas     = var.postgres_replicas

    selector {
      match_labels = {
        "app" = var.postgres_name
      }
    }

    template {
      metadata {
        labels = {
          "app" = var.postgres_name
        }
      }

      spec {
        termination_grace_period_seconds = 30

        container {
          name  = "postgres"
          image = var.postgres_image

          port {
            container_port = 5432
            name           = "postgres"
          }

          env {
            name  = "POSTGRES_DB"
            value = var.postgres_database
          }

          env {
            name  = "POSTGRES_USER"
            value = var.postgres_user
          }

          env {
            name = "POSTGRES_PASSWORD"

            value_from {
              secret_key_ref {
                name = kubernetes_secret.postgres.metadata[0].name
                key  = "POSTGRES_PASSWORD"
              }
            }
          }

          env {
            name = "PGDATA"
            value = "/var/lib/postgresql/data/pgdata"
          }

          liveness_probe {
            exec {
              command = ["pg_isready", "-U", var.postgres_user]
            }
            initial_delay_seconds = 30
            timeout_seconds       = 5
            period_seconds        = 15
          }

          readiness_probe {
            exec {
              command = ["pg_isready", "-U", var.postgres_user]
            }
            initial_delay_seconds = 10
            timeout_seconds       = 3
            period_seconds        = 10
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "256Mi"
            }
            limits = {
              cpu    = "500m"
              memory = "1Gi"
            }
          }

          volume_mount {
            name       = "data"
            mount_path = "/var/lib/postgresql/data"
          }
        }
      }
    }

    volume_claim_template {
      metadata {
        name = "data"
      }

      spec {
        access_modes = ["ReadWriteOnce"]

        resources {
          requests = {
            storage = var.postgres_storage
          }
        }

        storage_class_name = var.storage_class
      }
    }
  }

  depends_on = [kubernetes_service.postgres_headless]
}
