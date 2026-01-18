import express from "express";
import {
  getActivityLogs,
  createActivityLog,
} from "../controllers/activityLogController.js";

const router = express.Router();

router.post("/", createActivityLog);
router.get("/", getActivityLogs);

export default router;
