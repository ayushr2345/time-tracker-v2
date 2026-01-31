import ActivityLog from "../models/activityLog.js";
import { validateActivityId } from "../utils/commonUtils.js";
import {
  validateLookBackWindow,
  validateTimeInputs,
  validateNoOverlaps,
} from "../utils/manualLogEntryUtils.js";
import {
  getActiveTimer,
  getActivityLog,
} from "../utils/timerModeEntryUtils.js";

// ==========================================
// 1. GET ALL (Safe & Simple)
// ==========================================
export const getActivityLogs = async (req, res) => {
  try {
    const activityLogs = await ActivityLog.find().sort({ startTime: -1 });
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

// ==========================================
// 3. GET LOGS FOR CUSTOM RANGE
// ==========================================
export const getActivityLogsForCustomRange = async (req, res) => {
  try {
    // 1. Extract the Range from the Request
    // The Frontend calculates "Start of Today" and "End of Today" in UTC and sends them here.
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        error:
          "Missing date range. Please provide 'from' and 'to' query parameters.",
      });
    }

    // 2. Run the Range Query
    const logs = await ActivityLog.find({
      startTime: {
        $gte: new Date(from), // Greater than or equal to Start Time
        $lte: new Date(to), // Less than or equal to End Time
      },
    })
      .populate("activityId", "name color") // Optional: Get Activity Name & Color instantly
      .sort({ startTime: -1 }); // Optional: Show newest logs first

    // 3. Return the result
    res.status(200).json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ error: "Failed to fetch activity logs." });
  }
};

// ==========================================
// 4. START TIMER
// ==========================================
export const startTimer = async (req, res) => {
  try {
    const { activityId } = req.body;
    if (!activityId) {
      return res.status(400).json({
        error: "Missing required field",
      });
    }

    const isValidActivityId = await validateActivityId(activityId);
    if (!isValidActivityId) {
      return res
        .status(404)
        .json({ error: "Invalid Activity ID or Activity not found" });
    }

    const activeTimer = await getActiveTimer();
    if (activeTimer) {
      return res.status(409).json({
        error: "A timer is already running, please stop it first.",
        activeLog: activeTimer,
      });
    }

    const newActivityLog = new ActivityLog({
      activityId: activityId,
      createdAt: new Date(),
      startTime: new Date(),
      endTime: null,
      lastHeartbeat: new Date(),
      entryType: "timer",
      status: "active",
      duration: null,
    });
    const savedActivityLog = await newActivityLog.save();
    res.status(201).json(savedActivityLog);
  } catch (error) {
    console.error("Error starting timer log:", error);
    res.status(500).json({ error: "Failed to start timer log" });
  }
};

// ==========================================
// 5. STOP TIMER
// ==========================================
export const stopTimer = async (req, res) => {
  try {
    const { activityLogId } = req.body;
    if (!activityLogId) {
      return res.status(400).json({
        error: "Missing required field",
      });
    }

    const activityLog = await getActivityLog(activityLogId);
    if (!activityLog) {
      return res.status(404).json({
        error: "Activity Log not found.",
      });
    }

    if (activityLog.entryType !== "timer") {
      return res.status(400).json({
        error: "Invalid operation. This is a manual entry, not a live timer.",
      });
    }

    if (activityLog.status === "completed") {
      return res.status(400).json({ error: "Timer is already stopped." });
    }
    if (activityLog.status === "paused") {
      return res
        .status(400)
        .json({ error: "Timer is paused, resume the timer before stopping." });
    }

    const activityEndTime = new Date();
    const totalPauseDurationInMs = activityLog.pauseHistory.reduce((acc, p) => {
      if (p.pauseTime && p.resumeTime) {
        return acc + (new Date(p.resumeTime) - new Date(p.pauseTime));
      }
      return acc;
    }, 0);
    const totalDurationInSeconds = Math.max(
      0,
      Math.round(
        (activityEndTime - activityLog.startTime - totalPauseDurationInMs) /
          1000,
      ),
    );

    activityLog.endTime = activityEndTime;
    activityLog.lastHeartbeat = activityEndTime;
    activityLog.status = "completed";
    activityLog.duration = totalDurationInSeconds;
    const savedLog = await activityLog.save();
    res.status(200).json(savedLog);
  } catch (error) {
    console.error("Error stopping timer log:", error);
    res.status(500).json({ error: "Failed to stop timer log" });
  }
};

// ==========================================
// 6. PAUSE TIMER
// ==========================================
export const pauseTimer = async (req, res) => {
  try {
    const { activityLogId } = req.body;
    if (!activityLogId) {
      return res.status(400).json({
        error: "Missing required field",
      });
    }

    const activityLog = await getActivityLog(activityLogId);
    if (!activityLog) {
      return res.status(404).json({
        error: "Activity Log not found.",
      });
    }

    if (activityLog.entryType !== "timer") {
      return res.status(400).json({
        error: "Invalid operation. This is a manual entry, not a live timer.",
      });
    }

    if (activityLog.status === "completed") {
      return res.status(400).json({ error: "Timer is already stopped." });
    }
    if (activityLog.status === "paused") {
      return res.status(400).json({ error: "Timer is already paused." });
    }

    const activityPauseTime = new Date();

    activityLog.lastHeartbeat = activityPauseTime;
    activityLog.status = "paused";
    activityLog.pauseHistory.push({ pauseTime: activityPauseTime });
    const savedLog = await activityLog.save();
    res.status(200).json(savedLog);
  } catch (error) {
    console.error("Error pausing timer log:", error);
    res.status(500).json({ error: "Failed to pause timer log" });
  }
};

// ==========================================
// 7. RESUME TIMER
// ==========================================
export const resumeTimer = async (req, res) => {
  try {
    const { activityLogId } = req.body;
    if (!activityLogId) {
      return res.status(400).json({
        error: "Missing required field",
      });
    }

    const activityLog = await getActivityLog(activityLogId);
    if (!activityLog) {
      return res.status(404).json({
        error: "Activity Log not found.",
      });
    }

    if (activityLog.entryType !== "timer") {
      return res.status(400).json({
        error: "Invalid operation. This is a manual entry, not a live timer.",
      });
    }

    if (activityLog.status === "completed") {
      return res.status(400).json({ error: "Timer is already stopped." });
    }
    if (activityLog.status === "active") {
      return res.status(400).json({ error: "Timer is already active." });
    }
    if (activityLog.pauseHistory.length <= 0) {
      return res.status(404).json({
        error: "No pause history exists for this activity, cannot resume timer",
      });
    }

    const activityResumeTime = new Date();

    activityLog.lastHeartbeat = activityResumeTime;
    activityLog.status = "active";

    const lastPauseIndex = activityLog.pauseHistory.length - 1;
    if (lastPauseIndex >= 0) {
      activityLog.pauseHistory[lastPauseIndex].resumeTime = activityResumeTime;
    }
    const savedLog = await activityLog.save();
    res.status(200).json(savedLog);
  } catch (error) {
    console.error("Error resuming timer log:", error);
    res.status(500).json({ error: "Failed to resume timer log" });
  }
};

// ==========================================
// 8. HEARTBEAT
// ==========================================
export const sendHeartbeat = async (req, res) => {
  try {
    const { activityLogId } = req.body;
    if (!activityLogId) {
      return res.status(400).json({
        error: "Missing required field",
      });
    }

    const activityLog = await getActivityLog(activityLogId);
    if (!activityLog) {
      return res.status(404).json({
        error: "Activity Log not found.",
      });
    }

    if (activityLog.entryType !== "timer") {
      return res.status(400).json({
        error: "Invalid operation. This is a manual entry, not a live timer.",
      });
    }

    if (activityLog.status === "completed") {
      return res.status(400).json({ error: "Timer is already stopped." });
    }

    const heartbeatTime = new Date();

    activityLog.lastHeartbeat = heartbeatTime;
    const savedLog = await activityLog.save();
    res.status(200).json(savedLog);
  } catch (error) {
    console.error("Error saving heartbeat.", error);
    res.status(500).json({ error: "Failed to save heartbeat" });
  }
};

// ==========================================
// 9. RESET TIMER
// ==========================================
export const resetTimer = async (req, res) => {
  try {
    const { activityLogId } = req.body;
    if (!activityLogId) {
      return res.status(400).json({
        error: "Missing required field",
      });
    }

    const activityLog = await getActivityLog(activityLogId);
    if (!activityLog) {
      return res.status(404).json({
        error: "Activity Log not found.",
      });
    }

    if (activityLog.entryType !== "timer") {
      return res.status(400).json({
        error: "Invalid operation. This is a manual entry, not a live timer.",
      });
    }

    if (activityLog.status === "completed") {
      return res.status(400).json({ error: "Timer is already stopped." });
    }

    await ActivityLog.findByIdAndDelete(activityLogId);
    res.status(200).json({ message: "Timer discarded successfully" });
  } catch (error) {
    console.error("Error resetting the timer", error);
    res.status(500).json({ error: "Failed to reset the timer" });
  }
};

// ==========================================
// 10. RESUME CRASHED TIMER (Heal Gap)
// ==========================================
export const resumeCrashedTimer = async (req, res) => {
  try {
    const { activityLogId } = req.body;
    if (!activityLogId) {
      return res.status(400).json({
        error: "Missing required field",
      });
    }

    const activityLog = await getActivityLog(activityLogId);
    if (!activityLog) {
      console.log("Not found");
      return res.status(404).json({
        error: "Activity Log not found.",
      });
    }

    if (activityLog.entryType !== "timer") {
      return res.status(400).json({
        error: "Invalid operation. This is a manual entry, not a live timer.",
      });
    }

    if (activityLog.status !== "active") {
      return res.status(200).json(activityLog);
    }

    const now = new Date();
    const lastHeartbeat = new Date(activityLog.lastHeartbeat);
    const gapDuration = now - lastHeartbeat;
    const FIVE_MINUTES = 5 * 60 * 1000;
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    if (gapDuration > FIVE_MINUTES && gapDuration < TWENTY_FOUR_HOURS) {
      console.log(
        `[Recovery] Gap detected: ${Math.floor(gapDuration / 60000)} min. Injecting pause.`,
      );
      activityLog.pauseHistory.push({
        pauseTime: lastHeartbeat,
        resumeTime: now,
      });

      activityLog.lastHeartbeat = now;

      const savedLog = await activityLog.save();
      return res.status(200).json(savedLog);
    } else if (gapDuration >= TWENTY_FOUR_HOURS) {
      console.log(
        `[Recovery] Timer abandoned (>24h). Auto-stopping at last heartbeat.`,
      );

      const totalPauseDurationInMs = activityLog.pauseHistory.reduce(
        (acc, p) => {
          if (p.pauseTime && p.resumeTime) {
            return acc + (new Date(p.resumeTime) - new Date(p.pauseTime));
          }
          return acc;
        },
        0,
      );

      const validDuration = Math.max(
        0,
        Math.round(
          (lastHeartbeat -
            new Date(activityLog.startTime) -
            totalPauseDurationInMs) /
            1000,
        ),
      );

      activityLog.endTime = lastHeartbeat;
      activityLog.status = "completed";
      activityLog.duration = validDuration;

      const savedLog = await activityLog.save();
      return res.status(200).json(savedLog);
    }

    activityLog.lastHeartbeat = now;
    await activityLog.save();
    res.status(200).json(activityLog);
  } catch (error) {
    console.error("Error resuming crashed timer:", error);
    res.status(500).json({ error: "Failed to resume crashed timer" });
  }
};
