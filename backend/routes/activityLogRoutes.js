import express from "express";
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
} from "../controllers/activityLogController.js";

const router = express.Router();

router.post("/createManualEntryLog", createManualLogEntry);
router.get("/getActivityLogs", getActivityLogs);
router.get("/getActivityLogsForCustomRange", getActivityLogsForCustomRange);
router.post("/startTimer", startTimer);
router.put("/stopTimer", stopTimer);
router.put("/pauseTimer", pauseTimer);
router.put("/resumeTimer", resumeTimer);
router.put("/sendHeartbeat", sendHeartbeat);
router.delete("/resetTimer", resetTimer)
router.put("/resumeCrashedTimer", resumeCrashedTimer)

export default router;
