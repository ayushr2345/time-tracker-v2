import mongoose from "mongoose";

/**
 * ActivityLog Schema
 * Represents a log entry for an activity tracking session.
 * @typedef  {Object} ActivityLog
 * @property {ObjectId} activityId - Reference to the Activity document (required)
 * @property {Date} createdAt - When the log was created (required, default: current date)
 * @property {Date} startTime - When the activity started (required)
 * @property {Date} endTime - When the activity ended (optional)
 * @property {Date} lastHeartbeat - Last heartbeat timestamp (required)
 * @property {string} entryType - Type of entry: "manual" or "timer" (required)
 * @property {string} status - Status of the log: "active", "paused", or "completed" (required, default: "active")
 * @property {Array} pauseHistory - Array of pause/resume events with pauseTime and resumeTime
 * @property {number} duration - Total duration in seconds (optional, default: 0)
 */
const activityLogSchema = new mongoose.Schema({
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Activity",
    required: true,
  },
  createdAt: { type: Date, required: true, default: Date.now },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: false },
  lastHeartbeat: { type: Date, required: true },
  entryType: { type: String, enum: ["manual", "timer"], required: true },
  status: {
    type: String,
    enum: ["active", "paused", "completed"],
    required: true,
    default: "active",
  },
  pauseHistory: [
    {
      pauseTime: { type: Date, required: true },
      resumeTime: { type: Date },
    },
  ],
  duration: { type: Number, required: false, default: 0 },
});

activityLogSchema.index({ status: 1, startTime: 1, endTime: 1 });

export default mongoose.model("ActivityLog", activityLogSchema);
