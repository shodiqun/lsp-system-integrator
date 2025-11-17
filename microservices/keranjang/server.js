const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const { createClient } = require("redis");

const PORT = process.env.PORT || 3002;
const REDIS_HOST = process.env.REDIS_HOST || "redis-cart";
const REDIS_PORT = Number(process.env.REDIS_PORT || "6379");
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

const app = express();
app.use(cors());
app.use(express.json());

const redisClient = createClient({
  socket: { host: REDIS_HOST, port: REDIS_PORT },
  password: REDIS_PASSWORD || undefined
});

redisClient.on("error", (err) => {
  console.error("Redis connection error", err);
});

async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

function cartKey(id) {
  return `cart:${id}`;
}

app.get("/", async (_req, res) => {
  try {
    await connectRedis();
    const status = await redisClient.ping();
    res.json({ status, service: "keranjang" });
  } catch (err) {
    res.status(500).json({ error: "Redis unavailable", details: err.message });
  }
});

app.post("/cart/add", async (req, res) => {
  const cartId = req.body.cartId || uuidv4();
  const email = req.body.email;
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const delaySec = Number(req.body.delaySec || process.env.ABANDONED_DELAY_SECONDS || 3600);

  if (!email) {
    return res.status(400).json({ error: "email wajib diisi" });
  }

  const payload = {
    cartId,
    email,
    items,
    delaySec,
    updatedAt: new Date().toISOString()
  };

  try {
    await connectRedis();
    await redisClient.set(cartKey(cartId), JSON.stringify(payload));
    res.status(201).json({ message: "Cart disimpan", cart: payload });
  } catch (err) {
    console.error("failed to store cart", err);
    res.status(500).json({ error: "Gagal menyimpan cart" });
  }
});

app.post("/cart/checkout", async (req, res) => {
  const cartId = req.body.cartId;
  if (!cartId) {
    return res.status(400).json({ error: "cartId wajib diisi" });
  }

  try {
    await connectRedis();
    const deleted = await redisClient.del(cartKey(cartId));
    if (deleted === 0) {
      return res.status(404).json({ error: "Cart tidak ditemukan" });
    }
    res.json({ message: "Cart checkout, data dihapus" });
  } catch (err) {
    console.error("failed to delete cart", err);
    res.status(500).json({ error: "Gagal menghapus cart" });
  }
});

app.get("/cart/:id", async (req, res) => {
  try {
    await connectRedis();
    const data = await redisClient.get(cartKey(req.params.id));
    if (!data) {
      return res.status(404).json({ error: "Cart tidak ditemukan" });
    }
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil cart" });
  }
});

app.listen(PORT, () => {
  console.log(`Keranjang service listening on port ${PORT}`);
});
