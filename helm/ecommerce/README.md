# Ecommerce Helm Chart

Deploys the four demo microservices used by the abandoned cart remediation flow:

- produk (catalog)
- user (customer profiles)
- keranjang (cart persistence backed by Redis)
- pembayaran (mock payment gateway)

Each service exposes an ingress host (e.g. `produk.local`). Adjust `values.yaml` to match custom registries or webhook URLs.

## Usage

```bash
cd helm/ecommerce
helm upgrade --install ecommerce . -n ecommerce --create-namespace
```

Override the `services[].image` fields if your Docker images live in a different registry.
