End-to-end setup on Minikube (Windows/PowerShell)
=================================================

Prereqs
- Docker Desktop (atau Docker CLI) dengan akses ke Minikube
- kubectl, Helm 3, Terraform, Ansible
- Akun SendGrid + API key (free tier cukup) dan alamat pengirim terverifikasi

1) Boot Minikube
- PowerShell:
  - `minikube start --cpus 4 --memory 8192`
  - `setx MINIKUBE_IP (minikube ip)` (opsional agar mudah copy)
  - Tambahkan ke `C:\Windows\System32\drivers\etc\hosts`:
    - `<minikube ip> n8n.local shop.local produk.local user.local keranjang.local pembayaran.local jenkins.local grafana.local`

2) Enable NGINX Ingress via Ansible
```powershell
cd ansible
ansible-playbook -i inventory install_ingress.yaml
```
> Alternatif manual: `minikube addons enable ingress`

3) Provision cluster primitives dengan Terraform
```powershell
cd terraform
terraform init
terraform apply
```
Terraform akan membuat namespace `ecommerce`, StatefulSet PostgreSQL, services, dan secret kredensial.

4) Build image microservices
- Set Docker agar build ke daemon Minikube:
  - `minikube -p minikube docker-env --shell powershell | Invoke-Expression`
- Build manual (opsi cepat):
  ```powershell
  docker build -t tokoauto/produk-service:latest microservices/produk
  docker build -t tokoauto/user-service:latest microservices/user
  docker build -t tokoauto/keranjang-service:latest microservices/keranjang
  docker build -t tokoauto/pembayaran-service:latest microservices/pembayaran
  ```
- Atau jalankan pipeline Jenkins setelah chart `helm/platform` dideploy (lihat langkah 5) dan isikan credential Docker Hub `dockerhub-creds`.

5) Deploy workload ke Kubernetes
- Deploy demo Online Boutique untuk menyediakan frontend & Redis:
  ```powershell
  kubectl -n ecommerce apply -k microservices-demo/kubernetes-manifests
  kubectl apply -f k8s/ingress/frontend-ingress.yaml
  ```
- Deploy helm chart microservices custom:
  ```powershell
  helm upgrade --install ecommerce helm/ecommerce -n ecommerce --create-namespace
  ```
- Deploy platform tooling (Jenkins + Prometheus + Grafana):
  ```powershell
  cd helm/platform
  helm dependency update
  helm upgrade --install platform . -n platform --create-namespace
  ```
  (Grafana tersedia lewat `http://grafana.local`, Jenkins di `http://jenkins.local`)

6) Deploy n8n dengan workflow bawaan
```powershell
kubectl apply -f k8s/n8n/workflow-configmap.yaml
kubectl apply -f k8s/n8n/deployment.yaml
kubectl apply -f k8s/n8n/service.yaml
kubectl apply -f k8s/n8n/ingress.yaml
```
- Ganti `encryptionKey` pada `k8s/n8n/deployment.yaml` sebelum apply.
- Buka `http://n8n.local`, buat credential "SendGrid account" dan masukkan API key.
- Workflow `Abandoned Cart - Send Discount` otomatis terimport; set `fromEmail` ke sender yang sudah diverifikasi, lalu aktifkan jika perlu.

7) Build & deploy detector CronJob
- Build image Python:
  ```powershell
  docker build -t abandoned-detector:0.1 detector
  ```
- Konfigurasi secret webhook (isi URL & email demo):
  ```powershell
  kubectl apply -f k8s/abandoned-detector/secret.yaml
  ```
- (Opsional) Update `ABANDON_SECONDS` di `k8s/abandoned-detector/cronjob.yaml` menjadi 120 untuk demo cepat.
- Deploy CronJob:
  ```powershell
  kubectl apply -f k8s/abandoned-detector/cronjob.yaml
  ```

8) Uji alur
- Buka `http://shop.local`, tambahkan produk ke keranjang, jangan checkout.
- Jalankan job detector manual agar tidak menunggu cron:
  ```powershell
  kubectl create job -n ecommerce --from=cronjob/abandoned-detector detector-now-1
  kubectl logs -n ecommerce job/detector-now-1 -f
  ```
- Periksa eksekusi n8n:
  ```powershell
  kubectl logs -n ecommerce deploy/n8n -f
  ```
- Email diskon harus dikirim oleh SendGrid ke alamat yang ada di secret.

Uji webhook langsung (bypass detector)
```powershell
curl -X POST http://n8n.local/webhook/cart/abandoned `
  -H "Content-Type: application/json" `
  -d '{"email":"you@example.com","discountCode":"TEST123"}'
```

Troubleshooting
- 404 pada webhook → pastikan workflow aktif dan host `n8n.local` sudah mengarah ke IP Minikube.
- Ingress tidak dapat diakses → cek `minikube addons enable ingress` dan verifikasi pod `ingress-nginx-controller` siap.
- Jenkins crashloop → kurangi resource request di `helm/platform/values.yaml` atau tambah memori Minikube.
- Detector error Redis → pastikan `redis-cart` dari Online Boutique dalam status Running (`kubectl -n ecommerce get pods | findstr redis`).
