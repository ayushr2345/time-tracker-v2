import mongoose from "mongoose";

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

activityLogSchema.index({ startTime: 1, endTime: 1, status: 1 });

export default mongoose.model("ActivityLog", activityLogSchema);
