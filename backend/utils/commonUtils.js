import Activity from "../models/activity.js";

/**
 * Validates if an activity ID exists in the database.
 * @async
 * @function validateActivityId
 * @param    {string} activityId - The activity ID to validate
 * @returns  {Promise<boolean>} True if activity exists, false otherwise
 */
export const validateActivityId = async (activityId) => {
  try {
    if (!activityId) return false;
    const activityExists = await Activity.exists({ _id: activityId });
    if (!activityExists) return false;
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Calculates the total pause duration in ms from a pause history array.
 * @function calculateTotalPauseDurationInMs
 * @param    {Array} pauseHistory - The pause history for a timer activity log
 * @returns  {number} Total pause duration is ms or null otherwise
 */
export const calculateTotalPauseDurationInMs = (pauseHistory) => {
  if (!pauseHistory || pauseHistory.length === 0) return 0;

  return pauseHistory.reduce((acc, p) => {
    if (p.pauseTime && p.resumeTime) {
      return acc + (new Date(p.resumeTime) - new Date(p.pauseTime));
    }
    return acc;
  }, 0);
};
