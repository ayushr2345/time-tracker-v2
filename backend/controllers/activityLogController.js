import ActivityLog from "../models/activityLog.js";
import {
  validateActivityId,
  validateLookBackWindow,
  validateTimeInputs,
  validateNoOverlaps,
} from "../utils/manualLogEntryUtils.js";

// ==========================================
// 1. GET ALL (Safe & Simple)
// ==========================================
export const getActivityLogs = async (req, res) => {
  try {
    const activityLogs = await ActivityLog.find().sort({ name: 1 });
    res.status(200).json(activityLogs);
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res.status(500).json({ error: "Failed to fetch activity logs" });
  }
};

// ==========================================
// 2. CREATE NEW MANUAL LOG ENTRY (Handles Validation)
// ==========================================
export const createManualLogEntry = async (req, res) => {
  try {
    const { activityId, startTime, endTime } = req.body;
    if (!activityId || !startTime || !endTime) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const isValidActivityId = await validateActivityId(activityId);
    if (!isValidActivityId) {
      return res
        .status(404)
        .json({ error: "Invalid Activity ID or Activity not found" });
    }

    const lookBackWindowError = await validateLookBackWindow(startTime);
    if (lookBackWindowError) {
      return res.status(400).json({ error: lookBackWindowError });
    }

    const timeValidationError = validateTimeInputs(startTime, endTime);
    if (timeValidationError) {
      return res.status(400).json({ error: timeValidationError });
    }

    const overlappingError = await validateNoOverlaps(startTime, endTime);
    if (overlappingError) {
      return res.status(400).json({ error: overlappingError });
    }

    const newActivityLog = new ActivityLog({
      activityId: activityId,
      createdAt: new Date(startTime),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      lastHeartbeat: new Date(endTime),
      entryType: "manual",
      status: "completed",
      duration: (new Date(endTime) - new Date(startTime)) / 1000, // duration in seconds
    });
    const savedActivityLog = await newActivityLog.save();
    res.status(201).json(savedActivityLog);
  } catch (error) {
    console.error("Error creating activity log:", error);
    res.status(500).json({ error: "Failed to create activity log" });
  }
};
