import mongoose from "mongoose";
import { APP_CONFIG } from "../constants";
/**
 * Activity Schema
 * Represents a type of activity that can be tracked.
 * @typedef {Object} Activity
 * @property {string} name - The name of the activity (required, unique, case-insensitive)
 * @property {string} color - The color code for displaying the activity (default: APP_CONFIG.DEFAULT_ACTIVITY_COLOR)
 */
const activitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: { unique: true, collation: { locale: "en", strength: 2 } },
  },
  color: {
    type: String,
    required: true,
    default: APP_CONFIG.DEFAULT_ACTIVITY_COLOR,
  },
});

export default mongoose.model("Activity", activitySchema);
