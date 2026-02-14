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
