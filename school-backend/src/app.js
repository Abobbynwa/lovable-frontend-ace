import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import staffRoutes from "./routes/staff.js";
import studentRoutes from "./routes/student.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/staff", staffRoutes);
app.use("/student", studentRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/student", studentRoutes);

app.get("/", (req, res) => res.send("School Backend Running"));

app.listen(process.env.PORT, () =>
  console.log(`Backend running on port ${process.env.PORT}`)
);
