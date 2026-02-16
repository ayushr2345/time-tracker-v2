import ActivityLog, { ActivityLogDocument } from "../models/activityLog.js";
import { PauseInterval } from "@time-tracker/shared";

/**
 * Retrieves the currently running or paused timer from the database.
 * @async
 * @remarks
 * Used to ensure only one timer is active at a time, or to recover state on app load.
 * @returns Promise resolving to the active `ActivityLogDocument` or `null`.
 * @throws Error if the database query fails.
 */
export const getActiveTimer = async (): Promise<ActivityLogDocument | null> => {
  try {
    const activeLog = await ActivityLog.findOne({
      status: { $in: ["active", "paused"] },
    });
    return activeLog;
  } catch (error) {
    console.error("Error checking active timers:", error);
    throw new Error("Database error checking timer status");
  }
};

/**
 * Retrieves a specific activity log by its ID.
 * @async
 * @param activityLogId - The unique MongoDB ObjectId string.
 * @returns Promise resolving to the `ActivityLogDocument` or `null` if not found/invalid.
 */
export const getActivityLog = async (
  activityLogId: string,
): Promise<ActivityLogDocument | null> => {
  try {
    if (!activityLogId) return null;
    return await ActivityLog.findById(activityLogId);
  } catch (error) {
    console.error("Error fetching log:", error);
    return null;
  }
};

/**
 * Calculates the total duration of all completed pauses in milliseconds.
 * @remarks
 * Iterates through the pause history and sums up `(resumeTime - pauseTime)`.
 * Ignores pauses that are currently active (where `resumeTime` is undefined).
 * * @param pauseHistory - Array of pause intervals from the log.
 * @returns Total pause duration in milliseconds (default: 0).
 */
export const calculateTotalPauseDurationInMs = (
  pauseHistory: PauseInterval[] | undefined,
): number => {
  if (!pauseHistory || pauseHistory.length === 0) return 0;

  return pauseHistory.reduce((acc, p) => {
    // We only calculate duration for *completed* pause intervals (where resumeTime exists)
    if (p.pauseTime && p.resumeTime) {
      const start = new Date(p.pauseTime).getTime();
      const end = new Date(p.resumeTime).getTime();
      return acc + (end - start);
    }
    return acc;
  }, 0);
};
