import express from "express";

/**
 * ActivityLog Routes
 * Defines RESTful endpoints for managing activity logs and timers.
 */
import {
  getActivityLogs,
  createManualLogEntry,
  getActivityLogsForCustomRange,
  startTimer,
  stopTimer,
  pauseTimer,
  resumeTimer,
  sendHeartbeat,
  resetTimer,
  resumeCrashedTimer,
  deleteLogEntry,
} from "../controllers/activityLogController.js";

const router = express.Router();

router.post("/createManualEntryLog/:id", createManualLogEntry);
router.get("/getActivityLogs", getActivityLogs);
router.get("/getActivityLogsForCustomRange", getActivityLogsForCustomRange);
router.post("/startTimer/:id", startTimer);
router.patch("/stopTimer/:id", stopTimer);
router.patch("/pauseTimer/:id", pauseTimer);
router.patch("/resumeTimer/:id", resumeTimer);
router.patch("/sendHeartbeat/:id", sendHeartbeat);
router.delete("/resetTimer/:id", resetTimer);
router.patch("/resumeCrashedTimer/:id", resumeCrashedTimer);
router.delete("/deleteLogEntry/:id", deleteLogEntry);

export default router;
