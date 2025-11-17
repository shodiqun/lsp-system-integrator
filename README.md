Ecommerce Abandoned Cart Auto-Remediation (Minikube)
----------------------------------------------------

Proyek ini membangun arsitektur end-to-end yang mendeteksi keranjang belanja terbengkalai dan secara otomatis mengirim email diskon melalui n8n + SendGrid. Semua komponen dapat dijalankan di cluster Minikube lokal dan diorkestrasi lewat pipeline Jenkins.

Komponen Utama
- Terraform (`terraform/`) – membuat namespace `ecommerce` serta StatefulSet PostgreSQL lengkap dengan secret & service.
- Ansible (`ansible/`) – playbook untuk mengaktifkan NGINX Ingress Controller di Minikube.
- Microservices (`microservices/`) – service Node.js `produk`, `user`, `keranjang`, `pembayaran` yang siap dibungkus Docker.
- Helm Charts
  - `helm/ecommerce` untuk mendeploy microservices ke namespace `ecommerce`.
  - `helm/platform` (umbrella) untuk Jenkins + Prometheus + Grafana.
  - Folder `k8s/` berisi manifest tambahan (n8n, cronjob detector, ingress frontend).
- CI/CD (`jenkins/Jenkinsfile`) – pipeline yang build/push image Docker dan menjalankan Helm upgrade.
- Detector Python (`detector/`) – CronJob yang memindai Redis `redis-cart` dan memicu webhook n8n.
- n8n Workflows (`n8n/workflows/` dan `k8s/n8n/workflow-configmap.yaml`) – webhook `cart/abandoned` yang terhubung ke node SendGrid.

Langkah lengkap instalasi ada di `SETUP.md`.
