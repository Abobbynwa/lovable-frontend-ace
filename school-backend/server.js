import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./src/config/db.js"; // DB Connect
import appRouter from "./src/app.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Main API router
app.use("/api", appRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
