# Custom Microservices

Four lightweight Node.js services back the demo business logic and can be containerised with Docker:

- `produk` – serves a static catalog of items
- `user` – stores demo customers
- `keranjang` – writes cart state to Redis (`redis-cart`) so abandoned carts can be detected
- `pembayaran` – mock payment acknowledgement

## Local run

```bash
cd microservices/produk && npm install && npm start
```

Each service reads its port from `PORT` (defaults 3000–3003). `keranjang` additionally understands `REDIS_HOST`, `REDIS_PORT`, and `ABANDONED_DELAY_SECONDS`.

## Build images

```bash
docker build -t tokoauto/produk-service:latest microservices/produk
docker build -t tokoauto/user-service:latest microservices/user
docker build -t tokoauto/keranjang-service:latest microservices/keranjang
docker build -t tokoauto/pembayaran-service:latest microservices/pembayaran
```
