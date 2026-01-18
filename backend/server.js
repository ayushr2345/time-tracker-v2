import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.config.js";
import activityRoutes from "./routes/activityRoutes.js";
import activityLogRoutes from "./routes/activityLogRoutes.js";

dotenv.config();
const PORT = process.env.PORT || 5001;
const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use("/api/activities", activityRoutes);
app.use("/api/activity-logs", activityLogRoutes);

app.get("/", (_req, res) => {
  res.send("Hello, World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
