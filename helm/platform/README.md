# Platform Helm Chart

This umbrella chart deploys the supporting platform services required by the project:

- **Jenkins** (CI/CD)
- **kube-prometheus-stack** (Prometheus, Alertmanager, Grafana)

## Usage

```bash
cd helm/platform
helm dependency update
helm upgrade --install platform . -n platform --create-namespace
```

Key settings:

- Jenkins is exposed through an ingress at `jenkins.local`
- Grafana (bundled via kube-prometheus-stack) is exposed at `grafana.local`
- Jenkins credentials and Docker Hub secrets should be updated through the Jenkins UI after install

The values file keeps resource requests modest so the stack fits comfortably on a Minikube cluster.
