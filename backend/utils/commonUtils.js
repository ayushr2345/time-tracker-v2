import Activity from "../models/activity.js";

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
