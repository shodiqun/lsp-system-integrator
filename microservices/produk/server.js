const express = require("express");
const cors = require("cors");

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());

const products = [
  { id: "sku-1", name: "Kemeja Santai", price: 149000, tags: ["fashion", "diskon10"] },
  { id: "sku-2", name: "Tas Kulit Premium", price: 399000, tags: ["fashion"] },
  { id: "sku-3", name: "Sneakers Putih", price: 329000, tags: ["sepatu"] },
  { id: "sku-4", name: "Headphone Wireless", price: 599000, tags: ["elektronik"] }
];

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "produk", items: products.length });
});

app.get("/products", (_req, res) => {
  res.json(products);
});

app.get("/products/:id", (req, res) => {
  const product = products.find((item) => item.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Produk tidak ditemukan" });
  }
  res.json(product);
});

app.listen(PORT, () => {
  console.log(`Produk service listening on port ${PORT}`);
});
