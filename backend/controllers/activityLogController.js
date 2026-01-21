import ActivityLog from "../models/activityLog.js";

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
export const createActivityLog = async (req, res) => {
  try {
    const {activityid, startTime, endTime} = req.body;
    if (!activityid || !startTime || !endTime) {
      return res.status(400).json({
        error: "Missing required fields"
    });
    }

    const newActivityLog = new ActivityLog({
        activityId: activityid,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        lastHeartbeat: new Date(),
        entryType,
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