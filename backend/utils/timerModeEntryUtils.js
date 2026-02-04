import ActivityLog from "../models/activityLog.js";

/**
 * Retrieves the currently active or paused timer.
 * @async
 * @function getActiveTimer
 * @returns {Promise<Object|null>} The active timer activity log or null if none exists
 * @throws {Error} If database query fails
 */
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

/**
 * Retrieves an activity log by its ID.
 * @async
 * @function getActivityLog
 * @param {string} activityLogId - The activity log ID to fetch
 * @returns {Promise<Object|null>} The activity log document or null if not found
 */
export const getActivityLog = async (activityLogId) => {
  try {
    if (!activityLogId) return null;
    return await ActivityLog.findById(activityLogId);
  } catch (error) {
    console.error("Error fetching log:", error);
    return null;
  }
};
