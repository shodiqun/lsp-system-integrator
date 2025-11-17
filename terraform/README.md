# Terraform Bootstrap

This module provisions the shared Kubernetes building blocks required by the project:

- Namespace `ecommerce`
- Secret containing PostgreSQL credentials (random password)
- Headless + ClusterIP services for PostgreSQL
- StatefulSet `postgres` with a persistent volume claim

## Usage

```bash
cd terraform
terraform init
terraform apply
```

Variables can be overridden via `-var` flags or a `terraform.tfvars` file. The defaults assume:

- Minikube kubeconfig at `~/.kube/config`
- StorageClass named `standard`
- Single PostgreSQL replica using `postgres:16-alpine`

Inspect outputs after apply to retrieve the service and secret names if other components need them.
