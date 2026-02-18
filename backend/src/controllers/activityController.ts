import { Request, Response } from "express";
import Activity, { ActivityDocument } from "../models/activity.js";
import { HTTP_STATUS, APP_LIMITS, MONGO_DB_ERRORS } from "@time-tracker/shared";
import {
  ActivityWithLogCount,
  CreateActivityPayload,
  UpdateActivityPayload,
} from "@time-tracker/shared";

/**
 * Retrieves all activities from the database, sorted alphabetically by name.
 * @remarks
 * Uses an aggregation pipeline to count the number of logs associated with each activity.
 */
export const getActivities = async (
  req: Request,
  res: Response<ActivityWithLogCount[] | { error: string }>,
) => {
  try {
    const activities = await Activity.aggregate<ActivityWithLogCount>([
      {
        $lookup: {
          from: "activitylogs", // Ensure this matches your collection name in Mongo
          localField: "_id",
          foreignField: "activityId",
          as: "logs",
        },
      },
      {
        $addFields: {
          logCount: { $size: "$logs" },
        },
      },
      {
        $project: {
          logs: 0,
          __v: 0,
        },
      },
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
 * Creates a new activity.
 * @remarks
 * Validates uniqueness and non-empty names.
 */
export const createActivity = async (
  req: Request<{}, {}, CreateActivityPayload>,
  res: Response<ActivityDocument | { error: string }>,
) => {
  try {
    const { name, color } = req.body;

    if (!name || !name.trim()) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: "Activity name is required" });
    }

    const newActivity = new Activity({
      name: name.trim().slice(0, APP_LIMITS.MAX_ACTIVITY_NAME_LENGTH),
      color: color || APP_LIMITS.DEFAULT_ACTIVITY_COLOR,
    });

    await newActivity.save();
    res.status(HTTP_STATUS.CREATED).json(newActivity);
  } catch (error: any) {
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
 */
export const deleteActivity = async (
  req: Request<{ id: string }>,
  res: Response<{ message: string } | { error: string }>,
) => {
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
 * Updates an activity's name and/or color.
 * @remarks
 * Uses `UpdateActivityPayload` (Partial) to allow updating just the color or just the name.
 */
export const updateActivity = async (
  req: Request<{ id: string }, {}, UpdateActivityPayload>,
  res: Response<ActivityDocument | { error: string }>,
) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

    // Validation: Ensure we aren't saving an empty name if one was provided
    if (name !== undefined && !name.trim()) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: "Activity name cannot be empty" });
    }

    // Construct update object dynamically to avoid overwriting with undefined
    const updateData: UpdateActivityPayload = {};
    if (name) updateData.name = name.trim();
    if (color) updateData.color = color;

    const updatedActivity = await Activity.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }, // runValidators checks Schema rules again
    );

    if (!updatedActivity) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ error: "Activity not found" });
    }

    res.status(HTTP_STATUS.OK).json(updatedActivity);
  } catch (error: any) {
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
