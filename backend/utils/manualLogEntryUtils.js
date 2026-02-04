import { APP_CONFIG } from "../constants.js";
import ActivityLog from "../models/activityLog.js";

/**
 * Validates that the provided start time is within the lookback window (today or yesterday).
 * @function validateLookBackWindow
 * @param    {string} startTime - The start time to validate (ISO string)
 * @returns  {string|null} Error message if invalid, null if valid
 */
export const validateLookBackWindow = (startTime) => {
  const start = new Date(startTime);
  const now = new Date(); // for handling time zones

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  if (start < yesterday) {
    return "Grace period ended. You can only log activities for Today or Yesterday.";
  }
  return null;
};

/**
 * Validates time inputs for activity log entries.
 * Checks that times are valid dates, not in the future, and meet duration constraints.
 * @function validateTimeInputs
 * @param    {string} startTime - The activity start time (ISO string)
 * @param    {string} endTime - The activity end time (ISO string)
 * @returns  {string|null} Error message if invalid, null if valid
 */
export const validateTimeInputs = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  if (isNaN(start) || isNaN(end)) {
    return "Invalid date format provided.";
  }

  if (start > now) {
    return "Start time cannot be in future.";
  }
  if (end > now) {
    return "End time cannot be in future.";
  }

  if (start > end) {
    return "Start time must be before End time.";
  }

  const durationMs = end - start;

  if (durationMs < APP_CONFIG.MIN_ACTIVITY_DURATION_MS) {
    return "Activity Duration must be at least 5 minutes";
  }
  if (durationMs > APP_CONFIG.MAX_ACTIVITY_DURATION_MS) {
    return "Activity Duration cannot exceed 24 Hours";
  }

  return null;
};

/**
 * Validates that the provided time range does not overlap with existing completed activity logs.
 * @async
 * @function validateNoOverlaps
 * @param    {string} startTime - The activity start time (ISO string)
 * @param    {string} endTime - The activity end time (ISO string)
 * @returns  {Promise<string|null>} Error message if overlap detected, null if valid
 */
export const validateNoOverlaps = async (startTime, endTime) => {
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const overlapLog = await ActivityLog.findOne({
      status: "completed",
      $and: [{ startTime: { $lt: end } }, { endTime: { $gt: start } }],
    }).populate("activityId", "name");

    if (overlapLog) {
      const activityName = overlapLog.activityId
        ? overlapLog.activityId.name
        : "Unknown Activity";
      const sTime = overlapLog.startTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const eTime = overlapLog.endTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `Time overlap detected with "${activityName}" (${sTime} - ${eTime}).`;
    }
    return null;
  } catch (error) {
    console.error("Overlap Check Error:", error);
    return "Unable to verify time overlaps due to server error.";
  }
};
