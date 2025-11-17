const express = require("express");
const cors = require("cors");

const PORT = process.env.PORT || 3003;

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "pembayaran" });
});

app.post("/pay", (req, res) => {
  const { cartId, amount, email } = req.body;
  if (!cartId || !amount) {
    return res.status(400).json({ error: "cartId dan amount wajib diisi" });
  }
  res.json({
    cartId,
    amount,
    email: email || null,
    status: "PAID",
    message: "Pembayaran sukses (dummy)"
  });
});

app.listen(PORT, () => {
  console.log(`Pembayaran service listening on port ${PORT}`);
});
