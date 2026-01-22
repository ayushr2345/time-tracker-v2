import Activity from "../models/activity.js";
import ActivityLog from "../models/activityLog.js";

export const validateActivityId = async (activityId) => {
  try {
    if (!activityId) return false;
    const activityExists = await Activity.findById(activityId);
    if (!activityExists) return false;
    return true;
  } catch (error) {
    return false;
  }
};

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
  const fiveMinutesMs = 5 * 60 * 1000;
  const twentyFourHoursMs = 24 * 60 * 60 * 1000;

  if (durationMs < fiveMinutesMs) {
    return "Activity Duration must be at least 5 minutes";
  }
  if (durationMs > twentyFourHoursMs) {
    return "Activity Duration cannot exceed 24 Hours";
  }

  return null;
};

export const validateNoOverlaps = async (startTime, endTime) => {
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const overlapLog = await ActivityLog.findOne({
      status: "completed",
      $and: [
        { startTime: { $lt: end } },
        { endTime: { $gt: start } }
      ]
    }).populate("activityId", "name");

    if (overlapLog) {
      const activityName = overlapLog.activityId ? overlapLog.activityId.name : "Unknown Activity";
      const sTime = overlapLog.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const eTime = overlapLog.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `Time overlap detected with "${activityName}" (${sTime} - ${eTime}).`;
    }
    return null;
  } catch (error) {
    console.error("Overlap Check Error:", error);
    return "Unable to verify time overlaps due to server error.";
  }
};
