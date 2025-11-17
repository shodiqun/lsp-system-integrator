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
  const itemsHtml = products
    .map(
      (p) => `
        <li>
          <strong>${p.name}</strong> - Rp${p.price.toLocaleString("id-ID")}
          <br />
          <small>ID: ${p.id}</small>
        </li>`
    )
    .join("");

  const html = `<!doctype html>
  <html lang="id">
    <head>
      <meta charset="utf-8" />
      <title>Produk Service</title>
      <style>
        body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background:#0f172a; color:#e5e7eb; margin:0; padding:0; }
        .page { max-width: 720px; margin: 40px auto; padding: 24px; background:#020617; border-radius:12px; box-shadow:0 10px 30px rgba(15,23,42,0.6); }
        h1 { margin-top:0; font-size:28px; }
        p { color:#9ca3af; }
        code { background:#020617; padding:2px 6px; border-radius:4px; }
        ul { padding-left:20px; }
        li { margin-bottom:10px; }
        .badge { display:inline-block; margin-top:6px; padding:2px 8px; border-radius:999px; background:#22c55e1a; color:#bbf7d0; font-size:12px; }
        .footer { margin-top:24px; font-size:12px; color:#6b7280; }
        a { color:#38bdf8; text-decoration:none; }
        a:hover { text-decoration:underline; }
      </style>
    </head>
    <body>
      <div class="page">
        <h1>Layanan Produk E‑Commerce</h1>
        <p>
          Layanan ini berjalan di <strong>Docker container</strong> pada VPS dan diekspos di port <code>${PORT}</code>.
          Data di bawah berasal dari API yang sama dengan endpoint <code>/products</code>.
        </p>
        <h2>Daftar Produk (${products.length} items)</h2>
        <ul>
          ${itemsHtml}
        </ul>
        <div class="badge">Status: online</div>
        <div class="footer">
          Endpoint JSON: <code>/products</code> dan <code>/products/&lt;id&gt;</code>
        </div>
      </div>
    </body>
  </html>`;

  res.send(html);
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
