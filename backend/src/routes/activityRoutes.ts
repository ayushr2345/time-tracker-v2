import express from "express";
import {
  getActivities,
  createActivity,
  deleteActivity,
  updateActivity,
} from "../controllers/activityController.js";

/**
 * Express Router for Activity Management.
 * @remarks
 * Defines the RESTful API endpoints for creating, retrieving, updating, and deleting activities.
 * Base path: `/api/activities` (configured in app.ts).
 */
const router = express.Router();

/**
 * @route GET /getActivities
 * @description Retrieves a list of all activities.
 * @remarks
 * - Returns an array of activity objects.
 * - Each object includes a computed `logCount` field via aggregation.
 * @access Public
 */
router.get("/getActivities", getActivities);

/**
 * @route POST /createActivity
 * @description Creates a new activity.
 * @remarks
 * - Expects a JSON body with `name` (required, unique) and `color` (required).
 * - Returns the newly created activity object.
 * @access Public
 */
router.post("/createActivity", createActivity);

/**
 * @route DELETE /deleteActivity/:id
 * @description Deletes a specific activity by its ID.
 * @param {string} id - The MongoDB ObjectId of the activity to delete (in URL params).
 * @remarks
 * - Returns a success message upon deletion.
 * - **Warning:** Does not currently cascade delete associated logs (unless handled in controller).
 * @access Public
 */
router.delete("/deleteActivity/:id", deleteActivity);

/**
 * @route PATCH /updateActivity/:id
 * @description Updates an existing activity.
 * @param {string} id - The MongoDB ObjectId of the activity to update (in URL params).
 * @remarks
 * - Expects a JSON body with partial fields to update (`name` and/or `color`).
 * - Returns the updated activity object.
 * @access Public
 */
router.patch("/updateActivity/:id", updateActivity);

export default router;
