const express = require("express");
const { CosmosClient } = require("@azure/cosmos");
const dotenv = require("dotenv");
const path = require("path");
const { randomUUID } = require("crypto");

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json());

// เชื่อมต่อกับ Azure Cosmos DB
const client = new CosmosClient(process.env.COSMOS_CONNECTION);
const databaseId = "FeedbackDB";
const containerId = "Feedbacks";

async function initDB() {
  const { database } = await client.databases.createIfNotExists({ id: databaseId });
  const { container } = await database.containers.createIfNotExists({ id: containerId });
  console.log("✅ Database and container ready");
}
initDB();

// 📩 API: เพิ่ม feedback (รองรับ fields เพิ่มเติมจาก client)
app.post("/api/feedback", async (req, res) => {
  try {
    const {
      name,
      message,
      email = "",
      rating = null,
      category = "",
      subscribe = false
    } = req.body;

    if (!name || !message) {
      return res.status(400).json({ error: "Missing fields: name and message are required" });
    }

    //สร้าง id ที่เรียงตามเวลา
    // ตัวอย่าง: FB-20251023-093015-543
    const timestamp = new Date();
    const id = `FB-${timestamp.toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}-${Math.floor(Math.random() * 1000)}`;

    // Normalize / validate
    const item = {
      id: randomUUID(),
      name: String(name).trim(),
      message: String(message).trim(),
      email: typeof email === "string" ? email.trim() : "",
      // try convert rating to integer 1-5, otherwise store null
      rating: (() => {
        const n = rating === null || rating === "" ? null : Number(rating);
        return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
      })(),
      category: typeof category === "string" ? category.trim() : "",
      subscribe: !!subscribe,
      createdAt: new Date().toISOString()
    };

    const { resource } = await client
      .database(databaseId)
      .container(containerId)
      .items.create(item);

    res.json(resource);
  } catch (err) {
    console.error("POST /api/feedback error:", err);
    res.status(500).json({ error: "Failed to save feedback" });
  }
});

// 📜 API: ดึง feedback ทั้งหมด
app.get("/api/feedback", async (req, res) => {
  try {
    // ใช้ createdAt เพื่อจัดเรียงล่าสุดขึ้นก่อน
    const query = "SELECT * FROM c ORDER BY c.createdAt DESC";
    const { resources } = await client.database(databaseId).container(containerId).items.query(query).fetchAll();
    res.json(resources);
  } catch (err) {
    console.error("GET /api/feedback error:", err);
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
});

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
