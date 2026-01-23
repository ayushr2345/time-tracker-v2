import express from "express";
import {
  getActivityLogs,
  createManualLogEntry,
  getActivityLogsForCustomRange,
} from "../controllers/activityLogController.js";

const router = express.Router();

router.post("/createManualEntryLog", createManualLogEntry);
router.get("/getActivityLogs", getActivityLogs);
router.get("/getActivityLogsForCustomRange", getActivityLogsForCustomRange);

export default router;
