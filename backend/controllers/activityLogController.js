import ActivityLog from "../models/activityLog.js";
import {
  validateActivityId,
  calculateTotalPauseDurationInMs,
} from "../utils/commonUtils.js";
import {
  validateLookBackWindow,
  validateTimeInputs,
  validateNoOverlaps,
} from "../utils/manualLogEntryUtils.js";
import {
  getActiveTimer,
  getActivityLog,
} from "../utils/timerModeEntryUtils.js";
import { APP_CONFIG, HTTP_STATUS } from "../constants.js";

/**
 * Retrieves all activity logs from the database, sorted by start time (newest first).
 * @async
 * @function getActivityLogs
 * @param    {Object} req - Express request object
 * @param    {Object} res - Express response object
 * @returns  {void} Returns JSON array of all activity logs or error response
 */
export const getActivityLogs = async (req, res) => {
  try {
    const activityLogs = await ActivityLog.find().sort({ startTime: -1 });
    res.status(HTTP_STATUS.OK).json(activityLogs);
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res
      .status(HTTP_STATUS.SERVER_ERROR)
      .json({ error: "Failed to fetch activity logs" });
  }
};

/**
 * Creates a new manual activity log entry with provided activity, start, and end times.
 * Validates activity ID, time inputs, lookback window, and time overlaps.
 * @async
 * @function createManualLogEntry
 * @param    {Object} req - Express request object
 * @param    {string} req.body.activityId - The activity ID for this log entry
 * @param    {string} req.body.startTime - The start time of the activity
 * @param    {string} req.body.endTime - The end time of the activity
 * @param    {Object} res - Express response object
 * @returns  {void} Returns created activity log JSON or validation error response
 */
export const createManualLogEntry = async (req, res) => {
  try {
    const activityId = req.params.id;
    const { startTime, endTime } = req.body;
    if (!activityId || !startTime || !endTime) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: "Missing required fields",
      });
    }

    const isValidActivityId = await validateActivityId(activityId);
    if (!isValidActivityId) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ error: "Invalid Activity ID or Activity not found" });
    }

    const lookBackWindowError = validateLookBackWindow(startTime);
    if (lookBackWindowError) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: lookBackWindowError });
    }

    const timeValidationError = validateTimeInputs(startTime, endTime);
    if (timeValidationError) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: timeValidationError });
    }

    const overlappingError = await validateNoOverlaps(startTime, endTime);
    if (overlappingError) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: overlappingError });
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
    res.status(HTTP_STATUS.CREATED).json(savedActivityLog);
  } catch (error) {
    console.error("Error creating activity log:", error);
    res
      .status(HTTP_STATUS.SERVER_ERROR)
      .json({ error: "Failed to create activity log" });
  }
};

/**
 * Retrieves activity logs for a custom date range.
 * Returns logs with populated activity details, sorted by start time (newest first).
 * @async
 * @function getActivityLogsForCustomRange
 * @param    {Object} req - Express request object
 * @param    {string} req.query.from - Start date (ISO string)
 * @param    {string} req.query.to - End date (ISO string)
 * @param    {Object} res - Express response object
 * @returns  {void} Returns JSON array of activity logs in range or error response
 */
export const getActivityLogsForCustomRange = async (req, res) => {
  try {
    // 1. Extract the Range from the Request
    // The Frontend calculates "Start of Today" and "End of Today" in UTC and sends them here.
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
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
    res.status(HTTP_STATUS.OK).json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    res
      .status(HTTP_STATUS.SERVER_ERROR)
      .json({ error: "Failed to fetch activity logs." });
  }
};

/**
 * Starts a new timer for the specified activity.
 * Validates that no other timer is currently running.
 * @async
 * @function startTimer
 * @param    {Object} req - Express request object
 * @param    {string} req.body.activityId - The activity ID to start timer for
 * @param    {Object} res - Express response object
 * @returns  {void} Returns created activity log with "active" status or error response
 */
export const startTimer = async (req, res) => {
  try {
    const activityId = req.params.id;
    if (!activityId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: "Missing required field",
      });
    }

    const isValidActivityId = await validateActivityId(activityId);
    if (!isValidActivityId) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ error: "Invalid Activity ID or Activity not found" });
    }

    const activeTimer = await getActiveTimer();
    if (activeTimer) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        error: "A timer is already running, please stop it first.",
        activeLog: activeTimer,
      });
    }

    const activityStartTime = new Date();
    const newActivityLog = new ActivityLog({
      activityId: activityId,
      createdAt: activityStartTime,
      startTime: activityStartTime,
      endTime: null,
      lastHeartbeat: activityStartTime,
      entryType: "timer",
      status: "active",
      duration: null,
    });
    const savedActivityLog = await newActivityLog.save();
    res.status(HTTP_STATUS.CREATED).json(savedActivityLog);
  } catch (error) {
    console.error("Error starting timer log:", error);
    res
      .status(HTTP_STATUS.SERVER_ERROR)
      .json({ error: "Failed to start timer log" });
  }
};

/**
 * Stops a running or paused timer and calculates total duration.
 * Accounts for pause periods when calculating the total duration.
 * @async
 * @function stopTimer
 * @param    {Object} req - Express request object
 * @param    {string} req.body.activityLogId - The activity log ID to stop
 * @param    {Object} res - Express response object
 * @returns  {void} Returns stopped activity log with "completed" status or error response
 */
export const stopTimer = async (req, res) => {
  try {
    const activityLogId = req.params.id;
    if (!activityLogId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: "Missing required field",
      });
    }

    const activityLog = await getActivityLog(activityLogId);
    if (!activityLog) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: "Activity Log not found.",
      });
    }

    if (activityLog.entryType !== "timer") {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: "Invalid operation. This is a manual entry, not a live timer.",
      });
    }

    if (activityLog.status === "completed") {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: "Timer is already stopped." });
    }

    const activityEndTime = new Date();
    const totalPauseDurationInMs = calculateTotalPauseDurationInMs(
      activityLog.pauseHistory,
    );
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
    res.status(HTTP_STATUS.OK).json(savedLog);
  } catch (error) {
    console.error("Error stopping timer log:", error);
    res
      .status(HTTP_STATUS.SERVER_ERROR)
      .json({ error: "Failed to stop timer log" });
  }
};

/**
 * Pauses a running timer and records the pause time.
 * @async
 * @function pauseTimer
 * @param    {Object} req - Express request object
 * @param    {string} req.body.activityLogId - The activity log ID to pause
 * @param    {Object} res - Express response object
 * @returns  {void} Returns paused activity log with "paused" status or error response
 */
export const pauseTimer = async (req, res) => {
  try {
    const activityLogId = req.params.id;
    if (!activityLogId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: "Missing required field",
      });
    }

    const activityLog = await getActivityLog(activityLogId);
    if (!activityLog) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: "Activity Log not found.",
      });
    }

    if (activityLog.entryType !== "timer") {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: "Invalid operation. This is a manual entry, not a live timer.",
      });
    }

    if (activityLog.status === "completed") {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: "Timer is already stopped." });
    }
    if (activityLog.status === "paused") {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: "Timer is already paused." });
    }

    const activityPauseTime = new Date();

    activityLog.lastHeartbeat = activityPauseTime;
    activityLog.status = "paused";
    activityLog.pauseHistory.push({ pauseTime: activityPauseTime });
    const savedLog = await activityLog.save();
    res.status(HTTP_STATUS.OK).json(savedLog);
  } catch (error) {
    console.error("Error pausing timer log:", error);
    res
      .status(HTTP_STATUS.SERVER_ERROR)
      .json({ error: "Failed to pause timer log" });
  }
};

/**
 * Resumes a paused timer and records the resume time in pause history.
 * @async
 * @function resumeTimer
 * @param    {Object} req - Express request object
 * @param    {string} req.body.activityLogId - The activity log ID to resume
 * @param    {Object} res - Express response object
 * @returns  {void} Returns resumed activity log with "active" status or error response
 */
export const resumeTimer = async (req, res) => {
  try {
    const activityLogId = req.params.id;
    if (!activityLogId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: "Missing required field",
      });
    }

    const activityLog = await getActivityLog(activityLogId);
    if (!activityLog) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: "Activity Log not found.",
      });
    }

    if (activityLog.entryType !== "timer") {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: "Invalid operation. This is a manual entry, not a live timer.",
      });
    }

    if (activityLog.status === "completed") {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: "Timer is already stopped." });
    }
    if (activityLog.status === "active") {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: "Timer is already active." });
    }
    if (activityLog.pauseHistory.length <= 0) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: "No pause history exists for this activity, cannot resume timer",
      });
    }

    const activityResumeTime = new Date();

    activityLog.lastHeartbeat = activityResumeTime;
    activityLog.status = "active";

    const lastPauseIndex = activityLog.pauseHistory.length - 1;
    if (lastPauseIndex >= 0) {
      if (activityLog.pauseHistory[lastPauseIndex].resumeTime) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error:
            "Last paused timer was already resumed, cannot resume an already resumed timer",
        });
      }
      activityLog.pauseHistory[lastPauseIndex].resumeTime = activityResumeTime;
    }
    const savedLog = await activityLog.save();
    res.status(HTTP_STATUS.OK).json(savedLog);
  } catch (error) {
    console.error("Error resuming timer log:", error);
    res
      .status(HTTP_STATUS.SERVER_ERROR)
      .json({ error: "Failed to resume timer log" });
  }
};

/**
 * Updates the last heartbeat timestamp for an active timer.
 * Used to detect if a timer has crashed or become disconnected.
 * @async
 * @function sendHeartbeat
 * @param    {Object} req - Express request object
 * @param    {string} req.body.activityLogId - The activity log ID to send heartbeat for
 * @param    {Object} res - Express response object
 * @returns  {void} Returns updated activity log with new heartbeat time or error response
 */
export const sendHeartbeat = async (req, res) => {
  try {
    const activityLogId = req.params.id;
    if (!activityLogId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: "Missing required field",
      });
    }

    const activityLog = await getActivityLog(activityLogId);
    if (!activityLog) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: "Activity Log not found.",
      });
    }

    if (activityLog.entryType !== "timer") {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: "Invalid operation. This is a manual entry, not a live timer.",
      });
    }

    if (activityLog.status === "completed") {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: "Timer is already stopped." });
    }

    const heartbeatTime = new Date();

    activityLog.lastHeartbeat = heartbeatTime;
    const savedLog = await activityLog.save();
    res.status(HTTP_STATUS.OK).json(savedLog);
  } catch (error) {
    console.error("Error saving heartbeat.", error);
    res
      .status(HTTP_STATUS.SERVER_ERROR)
      .json({ error: "Failed to save heartbeat" });
  }
};

/**
 * Discards/resets a timer by deleting the associated activity log.
 * @async
 * @function resetTimer
 * @param    {Object} req - Express request object
 * @param    {string} req.body.activityLogId - The activity log ID to reset
 * @param    {Object} res - Express response object
 * @returns  {void} Returns success message or error response
 */
export const resetTimer = async (req, res) => {
  try {
    const activityLogId = req.params.id;
    if (!activityLogId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: "Missing required field",
      });
    }

    const activityLog = await getActivityLog(activityLogId);
    if (!activityLog) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: "Activity Log not found.",
      });
    }

    if (activityLog.entryType !== "timer") {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: "Invalid operation. This is a manual entry, not a live timer.",
      });
    }

    if (activityLog.status === "completed") {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: "Timer is already stopped." });
    }

    await ActivityLog.findByIdAndDelete(activityLogId);
    res
      .status(HTTP_STATUS.NO_CONTENT)
      .json({ message: "Timer discarded successfully" });
  } catch (error) {
    console.error("Error resetting the timer", error);
    res
      .status(HTTP_STATUS.SERVER_ERROR)
      .json({ error: "Failed to reset the timer" });
  }
};

/**
 * Resumes a timer that may have crashed or lost connection.
 * Detects gaps in heartbeats and automatically pauses the timer if gap exceeds 5 minutes.
 * Auto-stops timer if gap exceeds 24 hours.
 * @async
 * @function resumeCrashedTimer
 * @param    {Object} req - Express request object
 * @param    {string} req.body.activityLogId - The activity log ID to resume
 * @param    {Object} res - Express response object
 * @returns  {void} Returns updated activity log or error response
 */
export const resumeCrashedTimer = async (req, res) => {
  try {
    const activityLogId = req.params.id;
    if (!activityLogId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: "Missing required field",
      });
    }

    const activityLog = await getActivityLog(activityLogId);
    if (!activityLog) {
      console.log("Not found");
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: "Activity Log not found.",
      });
    }

    if (activityLog.entryType !== "timer") {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: "Invalid operation. This is a manual entry, not a live timer.",
      });
    }

    if (activityLog.status !== "active") {
      return res.status(HTTP_STATUS.OK).json(activityLog);
    }

    const now = new Date();
    const lastHeartbeat = new Date(activityLog.lastHeartbeat);
    const gapDuration = now.getTime() - lastHeartbeat.getTime();

    if (
      gapDuration > APP_CONFIG.MIN_GAP_DURATION_FOR_CONFIRMATION_MS &&
      gapDuration < APP_CONFIG.MAX_GAP_DURATION_FOR_CONFIRMATION_MS
    ) {
      console.log(
        `[Recovery] Gap detected: ${Math.floor(gapDuration / (60 * 1000))} min. Injecting pause.`,
      );
      activityLog.pauseHistory.push({
        pauseTime: lastHeartbeat,
        resumeTime: now,
      });

      activityLog.lastHeartbeat = now;

      const savedLog = await activityLog.save();
      return res.status(HTTP_STATUS.OK).json(savedLog);
    } else if (gapDuration >= APP_CONFIG.NO_TIMER_RECOVERY_BEYOND_THIS_MS) {
      console.log(
        `[Recovery] Timer abandoned (>24h). Auto-stopping at last heartbeat.`,
      );

      const totalPauseDurationInMs = calculateTotalPauseDurationInMs(
        activityLog.pauseHistory,
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

      if (validDuration >= APP_CONFIG.MIN_ACTIVITY_DURATION_MS) {
        activityLog.endTime = lastHeartbeat;
        activityLog.status = "completed";
        activityLog.duration = validDuration;

        const savedLog = await activityLog.save();
        return res.status(HTTP_STATUS.OK).json(savedLog);
      } else {
        return res.status(HTTP_STATUS.OK).json(activityLog);
      }
    }

    activityLog.lastHeartbeat = now;
    await activityLog.save();
    res.status(HTTP_STATUS.OK).json(activityLog);
  } catch (error) {
    console.error("Error resuming crashed timer:", error);
    res
      .status(HTTP_STATUS.SERVER_ERROR)
      .json({ error: "Failed to resume crashed timer" });
  }
};
