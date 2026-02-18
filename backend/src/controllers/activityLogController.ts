import { Request, Response } from "express";
import ActivityLog, { ActivityLogDocument } from "../models/activityLog.js";
import { validateActivityId } from "../utils/commonUtils.js";
import {
  validateLookBackWindow,
  validateTimeInputs,
  validateNoOverlaps,
} from "../utils/manualLogEntryUtils.js";
import {
  getActiveTimer,
  getActivityLog,
  calculateTotalPauseDurationInMs,
} from "../utils/timerModeEntryUtils.js";
import { HTTP_STATUS, APP_LIMITS } from "@time-tracker/shared";

// Helper type for the aggregation result in getActivityLogs
interface ActivityLogWithDetails extends ActivityLogDocument {
  activityName: string;
  activityColor: string;
}

/**
 * Retrieves all activity logs, sorted by start time (newest first).
 * @remarks
 * Uses aggregation to join with Activity collection and flatten the name/color
 * into the root of the object for easier frontend consumption.
 */
export const getActivityLogs = async (
  req: Request,
  res: Response<ActivityLogWithDetails[] | { error: string }>,
) => {
  try {
    const activityLogs = await ActivityLog.aggregate<ActivityLogWithDetails>([
      // 1. Sort first (Latest logs first)
      { $sort: { startTime: -1 } },

      // 2. Join with 'activities' collection
      {
        $lookup: {
          from: "activities",
          localField: "activityId",
          foreignField: "_id",
          as: "activityInfo",
        },
      },

      // 3. Unwind (Flatten) to get a single object
      {
        $unwind: {
          path: "$activityInfo",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 4. Move specific fields to the top level
      {
        $addFields: {
          activityName: "$activityInfo.name",
          activityColor: "$activityInfo.color",
        },
      },

      // 5. Cleanup
      {
        $project: {
          activityInfo: 0,
          __v: 0,
        },
      },
    ]);
    res.status(HTTP_STATUS.OK).json(activityLogs);
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res
      .status(HTTP_STATUS.SERVER_ERROR)
      .json({ error: "Failed to fetch activity logs" });
  }
};

/**
 * Creates a new manual activity log entry.
 */
export const createManualLogEntry = async (
  req: Request<{ id: string }, {}, { startTime: string; endTime: string }>,
  res: Response<ActivityLogDocument | { error: string }>,
) => {
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

    // TS Fix: Use .getTime() for arithmetic
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationInSeconds = (end.getTime() - start.getTime()) / 1000;

    const newActivityLog = new ActivityLog({
      activityId: activityId,
      createdAt: start,
      startTime: start,
      endTime: end,
      lastHeartbeat: end,
      entryType: "manual",
      status: "completed",
      duration: durationInSeconds,
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
 */
export const getActivityLogsForCustomRange = async (
  req: Request<{}, {}, {}, { from: string; to: string }>,
  res: Response<ActivityLogDocument[] | { error: string }>,
) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error:
          "Missing date range. Please provide 'from' and 'to' query parameters.",
      });
    }

    const logs = await ActivityLog.find({
      startTime: {
        $gte: new Date(from),
        $lte: new Date(to),
      },
    })
      .populate("activityId", "name color")
      .sort({ startTime: -1 });

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
 */
export const startTimer = async (
  req: Request<{ id: string }, {}, { startTime?: string }>,
  res: Response<
    ActivityLogDocument | { error: string; activeLog?: ActivityLogDocument }
  >,
) => {
  try {
    const activityId = req.params.id;
    const { startTime } = req.body;

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

    const activityStartTime = startTime ? new Date(startTime) : new Date();

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
 * Stops a running or paused timer.
 */
export const stopTimer = async (
  req: Request<{ id: string }, {}, { endTime?: string }>,
  res: Response<ActivityLogDocument | { error: string }>,
) => {
  try {
    const activityLogId = req.params.id;
    const { endTime } = req.body;

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

    const activityEndTime = endTime ? new Date(endTime) : new Date();

    const totalPauseDurationInMs = calculateTotalPauseDurationInMs(
      activityLog.pauseHistory,
    );

    // TS Fix: Explicit getTime() for math
    const durationMs =
      activityEndTime.getTime() -
      new Date(activityLog.startTime).getTime() -
      totalPauseDurationInMs;
    const totalDurationInSeconds = Math.max(0, Math.round(durationMs / 1000));

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
 * Pauses a running timer.
 */
export const pauseTimer = async (
  req: Request<{ id: string }>,
  res: Response<ActivityLogDocument | { error: string }>,
) => {
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
    if (!activityLog.pauseHistory) {
      activityLog.pauseHistory = [];
    }
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
 * Resumes a paused timer.
 */
export const resumeTimer = async (
  req: Request<{ id: string }>,
  res: Response<ActivityLogDocument | { error: string }>,
) => {
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
    if (!activityLog.pauseHistory) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: "No pause history exists for this activity, cannot resume timer",
      });
    }
    if (activityLog.pauseHistory.length <= 0) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: "Pause history empty for this activity, cannot resume timer",
      });
    }

    const activityResumeTime = new Date();

    activityLog.lastHeartbeat = activityResumeTime;
    activityLog.status = "active";

    const lastPauseIndex = activityLog.pauseHistory.length - 1;
    if (lastPauseIndex >= 0) {
      if (activityLog.pauseHistory[lastPauseIndex].resumeTime) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: "Last paused timer was already resumed.",
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
 * Updates the last heartbeat timestamp.
 */
export const sendHeartbeat = async (
  req: Request<{ id: string }>,
  res: Response<ActivityLogDocument | { error: string }>,
) => {
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
 * Discards/resets a timer by deleting it.
 */
export const resetTimer = async (
  req: Request<{ id: string }>,
  res: Response<{ message: string } | { error: string }>,
) => {
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
 * Recovers a timer that may have crashed.
 */
export const resumeCrashedTimer = async (
  req: Request<{ id: string }>,
  res: Response<ActivityLogDocument | { error: string }>,
) => {
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

    if (activityLog.status !== "active") {
      return res.status(HTTP_STATUS.OK).json(activityLog);
    }

    const now = new Date();
    const lastHeartbeat = new Date(activityLog.lastHeartbeat);
    const gapDuration = now.getTime() - lastHeartbeat.getTime();

    // Gap Logic: 5 mins < Gap < 24 Hours
    if (
      gapDuration > APP_LIMITS.MIN_GAP_DURATION_FOR_CONFIRMATION_MS &&
      gapDuration < APP_LIMITS.MAX_GAP_DURATION_FOR_CONFIRMATION_MS
    ) {
      console.log(
        `[Recovery] Gap detected: ${Math.floor(gapDuration / (60 * 1000))} min. Injecting pause.`,
      );

      if (!activityLog.pauseHistory) {
        activityLog.pauseHistory = [];
      }

      // Inject a pause period covering the missing time
      activityLog.pauseHistory.push({
        pauseTime: lastHeartbeat,
        resumeTime: now,
      });

      activityLog.lastHeartbeat = now;
      const savedLog = await activityLog.save();
      return res.status(HTTP_STATUS.OK).json(savedLog);
    }
    // Abandon Logic: Gap > 24 Hours
    else if (gapDuration >= APP_LIMITS.NO_TIMER_RECOVERY_BEYOND_THIS_MS) {
      console.log(
        `[Recovery] Timer abandoned (>24h). Auto-stopping at last heartbeat.`,
      );

      const totalPauseDurationInMs = calculateTotalPauseDurationInMs(
        activityLog.pauseHistory,
      );

      // Calculate valid duration up to the last heartbeat
      const validDurationMs =
        lastHeartbeat.getTime() -
        new Date(activityLog.startTime).getTime() -
        totalPauseDurationInMs;
      const validDurationSec = Math.max(0, Math.round(validDurationMs / 1000));

      // Only save if it meets minimum duration criteria
      if (validDurationMs >= APP_LIMITS.MIN_ACTIVITY_DURATION_MS) {
        activityLog.endTime = lastHeartbeat;
        activityLog.status = "completed";
        activityLog.duration = validDurationSec;

        const savedLog = await activityLog.save();
        return res.status(HTTP_STATUS.OK).json(savedLog);
      } else {
        return res.status(HTTP_STATUS.OK).json(activityLog);
      }
    }

    // Normal operation (tiny gap)
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

/**
 * Deletes a specific activity log.
 */
export const deleteLogEntry = async (
  req: Request<{ id: string }>,
  res: Response<{ message: string } | { error: string }>,
) => {
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

    await ActivityLog.findByIdAndDelete(activityLogId);
    res
      .status(HTTP_STATUS.NO_CONTENT)
      .json({ message: "Activity log deleted successfully" });
  } catch (error) {
    console.error("Error deleting the activity log entry", error);
    res
      .status(HTTP_STATUS.SERVER_ERROR)
      .json({ error: "Failed to delete the activity log" });
  }
};
