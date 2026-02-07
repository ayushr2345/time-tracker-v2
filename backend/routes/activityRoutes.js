import express from "express";
const router = express.Router();

/**
 * Activity Routes
 * Defines RESTful endpoints for managing activities.
 */
import {
  getActivities,
  createActivity,
  deleteActivity,
  updateActivity,
} from "../controllers/activityController.js";

router.get("/getActivities", getActivities);
router.post("/createActivity", createActivity);
router.delete("/deleteActivity/:id", deleteActivity);
router.patch("/updateActivity/:id", updateActivity);

export default router;
