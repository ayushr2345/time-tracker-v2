/**
 * Main Server Entry Point
 * @fileoverview Initializes the Express application, connects to MongoDB, and registers API routes.
 */
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.config.js";
import activityRoutes from "./routes/activityRoutes.js";
import activityLogRoutes from "./routes/activityLogRoutes.js";
import { DEFAULT_PORTS } from "@time-tracker/shared";
import path from "path";
import { fileURLToPath } from "url";

// Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuration & Setup
 */
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
const app = express();
const PORT = process.env.BACKEND_PORT || DEFAULT_PORTS.DEFAULT_PORT_BACKEND;

/**
 * Database Connection
 * @remarks Establishes the connection to MongoDB before starting the server.
 */
connectDB();

/**
 * Middleware
 * - CORS: Enables Cross-Origin Resource Sharing.
 * - JSON Parser: Parses incoming requests with JSON payloads.
 */
app.use(cors());
app.use(express.json());

/**
 * API Routes
 * Mounts the route handlers for activities and logs.
 */
app.use("/api/activities", activityRoutes);
app.use("/api/activity-logs", activityLogRoutes);

/**
 * Health Check Endpoint
 * @route GET /
 */
app.get("/", (_req: Request, res: Response) => {
  res.send("Time Tracker API is running...");
});

/**
 * Start Server
 */
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
