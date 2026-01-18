import express from "express";
const router = express.Router();

import {
  getActivities,
  createActivity,
  deleteActivity,
  updateActivity,
} from "../controllers/activityController.js";

router.get("/getActivities", getActivities);
router.post("/createActivity", createActivity);
router.delete("/deleteActivity/:id", deleteActivity);
router.put("/updateActivity/:id", updateActivity);

export default router;
