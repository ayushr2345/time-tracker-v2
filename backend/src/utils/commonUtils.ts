import Activity from "../models/activity.js";

/**
 * Validates if an activity ID exists in the database.
 * @async
 * @param activityId - The MongoDB ObjectId string to validate.
 * @returns A promise resolving to true if valid and found, false otherwise.
 */
export const validateActivityId = async (
  activityId: string,
): Promise<boolean> => {
  try {
    if (!activityId) return false;

    // .exists() returns the object { _id: ... } if found, or null if not.
    const activityExists = await Activity.exists({ _id: activityId });

    return !!activityExists; // Cast truthy object/null to strict boolean
  } catch (error) {
    // Catches invalid ObjectId formats (CastError) and DB connection errors
    return false;
  }
};
