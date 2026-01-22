import express from "express";
import {
  getActivityLogs,
  createManualLogEntry,
} from "../controllers/activityLogController.js";

const router = express.Router();

router.post("/createManualEntryLog", createManualLogEntry);
router.get("/getActivityLogs", getActivityLogs);

export default router;
