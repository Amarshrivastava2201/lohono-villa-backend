import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";
import villaRoutes from "./routes/villa.routes.js";

dotenv.config();

// 1️⃣ Initialize app FIRST
const app = express();

// 2️⃣ Middleware
app.use(cors());
app.use(express.json());

// 3️⃣ Routes
app.use("/v1/villas", villaRoutes);

// 4️⃣ Test route
app.get("/", (req, res) => {
  res.send("Lohono Villa API running");
});

// 5️⃣ Start server AFTER everything is set
const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
