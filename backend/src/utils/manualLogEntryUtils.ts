import { APP_LIMITS } from "@time-tracker/shared";
import ActivityLog from "../models/activityLog.js";
import { ActivityDocument } from "../models/activity.js";

/**
 * Validates that the provided start time is within the allowed lookback window.
 * @remarks
 * Ensures users cannot log activities older than "Yesterday" (midnight of the previous day).
 * * @param startTime - The start time to validate (ISO string or Date object).
 * @returns Error message string if invalid, or `null` if valid.
 */
export const validateLookBackWindow = (
  startTime: string | Date,
): string | null => {
  const start = new Date(startTime);
  const now = new Date();

  // Set 'yesterday' to 00:00:00 of the previous day
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  if (start < yesterday) {
    return "Grace period ended. You can only log activities for Today or Yesterday.";
  }
  return null;
};

/**
 * Validates time inputs for a manual log entry.
 * @remarks
 * Checks for:
 * 1. Valid Date formats.
 * 2. Future dates (not allowed).
 * 3. Start > End (logical error).
 * 4. Minimum duration (e.g., 5 mins).
 * 5. Maximum duration (e.g., 24 hours).
 * * @param startTime - The activity start time.
 * @param endTime - The activity end time.
 * @returns Error message string if invalid, or `null` if valid.
 */
export const validateTimeInputs = (
  startTime: string | Date,
  endTime: string | Date,
): string | null => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return "Invalid date format provided.";
  }

  if (start > now) {
    return "Start time cannot be in the future.";
  }
  if (end > now) {
    return "End time cannot be in the future.";
  }

  if (start >= end) {
    return "Start time must be before End time.";
  }

  const durationMs = end.getTime() - start.getTime();

  if (durationMs < APP_LIMITS.MIN_ACTIVITY_DURATION_MS) {
    return "Activity Duration must be at least 5 minutes.";
  }
  if (durationMs > APP_LIMITS.MAX_ACTIVITY_DURATION_MS) {
    return "Activity Duration cannot exceed 24 Hours.";
  }

  return null;
};

/**
 * Validates that the requested time range does not overlap with existing logs.
 * @remarks
 * Checks against:
 * 1. **Completed Logs**: Where (NewStart < OldEnd) and (NewEnd > OldStart).
 * 2. **Active/Paused Timers**: Where the timer started *before* the new log ends.
 * * @param startTime - The requested start time.
 * @param endTime - The requested end time.
 * @returns Promise resolving to an error string if overlap exists, or `null` if safe.
 */
export const validateNoOverlaps = async (
  startTime: string | Date,
  endTime: string | Date,
): Promise<string | null> => {
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Find any log that conflicts
    const overlapLog = await ActivityLog.findOne({
      $or: [
        // Case 1: Overlap with a Completed Log
        {
          status: "completed",
          startTime: { $lt: end },
          endTime: { $gt: start },
        },
        // Case 2: Overlap with a Running/Paused Timer
        // (If a timer started BEFORE this manual log ends, it's a conflict)
        {
          status: { $in: ["active", "paused"] },
          startTime: { $lt: end },
        },
      ],
    }).populate<{ activityId: ActivityDocument }>("activityId", "name");

    if (overlapLog) {
      // Safe access to populated name
      const activityName = overlapLog.activityId
        ? overlapLog.activityId.name
        : "Unknown Activity";

      const sTime = new Date(overlapLog.startTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      if (overlapLog.endTime) {
        const eTime = new Date(overlapLog.endTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        return `Time overlap detected with "${activityName}" (${sTime} - ${eTime}).`;
      } else {
        return `Time overlap detected with a running timer for "${activityName}" (Started: ${sTime}). Please stop it first.`;
      }
    }

    return null;
  } catch (error) {
    console.error("Overlap Check Error:", error);
    return "Unable to verify time overlaps due to server error.";
  }
};
