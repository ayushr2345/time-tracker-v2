import Activity from "../models/activity.js";
import { APP_CONFIG, HTTP_STATUS, MONGO_DB_ERRORS } from "../constants.js";

/**
 * Retrieves all activities from the database, sorted alphabetically by name.
 * @async
 * @function getActivities
 * @param    {Object} req - Express request object
 * @param    {Object} res - Express response object
 * @returns  {void} Returns JSON array of all activities or error response
 */
export const getActivities = async (req, res) => {
  try {
    // Sort by name alphabetically for better UX
    const activities = await Activity.aggregate([
      // 1. Join with the logs collection to see usage
      {
        $lookup: {
          from: "activitylogs", // Check your DB: Mongoose usually pluralizes this (activitylogs)
          localField: "_id",
          foreignField: "activityId",
          as: "logs",
        },
      },
      // 2. Add a 'logCount' field (The size of the logs array)
      {
        $addFields: {
          logCount: { $size: "$logs" },
        },
      },
      // 3. Cleanup: Remove the heavy 'logs' array (we only need the count)
      {
        $project: {
          logs: 0,
          __v: 0,
        },
      },
      // 4. Sort alphabetically
      { $sort: { name: 1 } },
    ]);
    res.status(HTTP_STATUS.OK).json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res
      .status(HTTP_STATUS.SERVER_ERROR)
      .json({ error: "Failed to fetch activities" });
  }
};

/**
 * Creates a new activity with the provided name and color.
 * Validates that the activity name is not empty and handles duplicate name errors.
 * @async
 * @function createActivity
 * @param {Object} req - Express request object
 * @param {string} req.body.name - The activity name (required)
 * @param {string} req.body.color - The activity color (optional, defaults to "#ffffff")
 * @param {Object} res - Express response object
 * @returns {void} Returns created activity JSON or error response
 */
export const createActivity = async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name || !name.trim()) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: "Activity name is required" });
    }
    const newActivity = new Activity({
      name: name.trim().slice(0, APP_CONFIG.MAX_ACTIVITY_NAME_LENGTH),
      color: color || APP_CONFIG.DEFAULT_ACTIVITY_COLOR,
    });
    await newActivity.save();
    res.status(HTTP_STATUS.CREATED).json(newActivity);
  } catch (error) {
    // Handle Duplicate Name (Mongo Error 11000)
    if (error.code === MONGO_DB_ERRORS.DUPLICATE_KEY) {
      return res
        .status(HTTP_STATUS.CONFLICT)
        .json({ error: "An activity with this name already exists" });
    }
    console.error("Create Error:", error);
    res
      .status(HTTP_STATUS.SERVER_ERROR)
      .json({ error: "Server error while creating activity" });
  }
};

/**
 * Deletes an activity by its ID.
 * Returns 404 error if the activity is not found.
 * @async
 * @function deleteActivity
 * @param {Object} req - Express request object
 * @param {string} req.params.id - The activity ID to delete
 * @param {Object} res - Express response object
 * @returns {void} Returns success message or error response
 */
export const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedActivity = await Activity.findByIdAndDelete(id);
    if (!deletedActivity) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ error: "Activity not found" });
    }
    res
      .status(HTTP_STATUS.OK)
      .json({ message: "Activity deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res
      .status(HTTP_STATUS.SERVER_ERROR)
      .json({ error: "Error deleting activity" });
  }
};

/**
 * Updates an activity's name and/or color by its ID.
 * Validates that the name is not empty and handles duplicate name errors.
 * @async
 * @function updateActivity
 * @param {Object} req - Express request object
 * @param {string} req.params.id - The activity ID to update
 * @param {string} req.body.name - The new activity name (optional)
 * @param {string} req.body.color - The new activity color (optional)
 * @param {Object} res - Express response object
 * @returns {void} Returns updated activity JSON or error response
 */
export const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    // Validation: Ensure we aren't saving an empty name
    if (name && !name.trim()) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: "Activity name cannot be empty" });
    }
    const updatedActivity = await Activity.findByIdAndUpdate(
      id,
      { name: name?.trim(), color },
      { new: true, runValidators: true }, // runValidators checks Schema rules again
    );
    // Validation: If ID didn't match anything
    if (!updatedActivity) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ error: "Activity not found" });
    }
    res.status(HTTP_STATUS.OK).json(updatedActivity);
  } catch (error) {
    // Handle Duplicate (e.g., renaming "Gym" to existing "Coding")
    if (error.code === MONGO_DB_ERRORS.DUPLICATE_KEY) {
      return res
        .status(HTTP_STATUS.CONFLICT)
        .json({ error: "An activity with this name already exists" });
    }
    console.error("Update Error:", error);
    res
      .status(HTTP_STATUS.SERVER_ERROR)
      .json({ error: "Error updating activity" });
  }
};
