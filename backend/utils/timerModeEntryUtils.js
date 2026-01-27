import Activity from "../models/activity.js";
import ActivityLog from "../models/activityLog.js";

export const getActiveTimer = async () => {
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

export const getActivityLog = async (activityLogId) => {
  try {
    if (!activityLogId) return null;
    return await ActivityLog.findById(activityLogId);
  } catch (error) {
    console.error("Error fetching log:", error);
    return null;
  }
};
