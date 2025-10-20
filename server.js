const express = require("express");
const { CosmosClient } = require("@azure/cosmos");
const dotenv = require("dotenv");
const path = require("path");

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

// 📩 API: เพิ่ม feedback
app.post("/api/feedback", async (req, res) => {
  const { name, message } = req.body;
  if (!name || !message) return res.status(400).json({ error: "Missing fields" });

  const { resource } = await client
    .database(databaseId)
    .container(containerId)
    .items.create({ name, message, createdAt: new Date().toISOString() });

  res.json(resource);
});

// 📜 API: ดึง feedback ทั้งหมด
app.get("/api/feedback", async (req, res) => {
  const query = "SELECT * FROM c ORDER BY c._ts DESC";
  const { resources } = await client.database(databaseId).container(containerId).items.query(query).fetchAll();
  res.json(resources);
});

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
