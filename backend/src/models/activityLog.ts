import mongoose, { Schema, Document } from "mongoose";
import { ActivityLogEntry } from "@time-tracker/shared";

/**
 * @fileoverview Mongoose Model for ActivityLog.
 */

/**
 * Mongoose Document Interface for ActivityLog.
 * @remarks
 * We use `Omit` to handle type mismatches between Shared JSON and Mongoose:
 * 1. `_id`: Shared uses `string`, Mongoose uses `ObjectId`.
 * 2. `activityId`: Shared uses `string`, Mongoose uses `ObjectId` (for refs).
 */
export interface ActivityLogDocument
  extends Omit<ActivityLogEntry, "_id" | "activityId">, Document {
  /**
   * Mongoose Reference to the Activity.
   * We strictly type this as ObjectId to enable population later.
   */
  activityId: mongoose.Types.ObjectId;
}

/**
 * ActivityLog Schema Definition
 */
const activityLogSchema = new Schema<ActivityLogDocument>(
  {
    /** Reference to the parent Activity */
    activityId: {
      type: Schema.Types.ObjectId,
      ref: "Activity",
      required: true,
    },

    // createdAt is handled by timestamps: true
    // updatedAt is handled by timestamps: true

    /**
     * The start time of the session.
     * - For Timer: When the user clicked "Start".
     * - For Manual: The user-selected start time.
     */
    startTime: { type: Date, required: true },

    /**
     * The end time of the session.
     * - Null/Undefined while running.
     * - Populated when status becomes "completed".
     */
    endTime: { type: Date, required: false },

    /**
     * The "Pulse" of the active timer.
     * Used to detect zombie sessions (crashed browsers).
     */
    lastHeartbeat: { type: Date, required: true },

    /**
     * How was this entry created?
     */
    entryType: {
      type: String,
      enum: ["manual", "timer"],
      required: true,
    },

    /**
     * Current state of the session.
     * Defaults to "active" for new timers.
     */
    status: {
      type: String,
      enum: ["active", "paused", "completed"],
      required: true,
      default: "active",
    },

    /**
     * History of pauses to calculate accurate net duration.
     * Stored as an array of objects { pauseTime, resumeTime }.
     */
    pauseHistory: [
      {
        pauseTime: { type: Date, required: true },
        resumeTime: { type: Date },
      },
    ],

    /**
     * Net duration in seconds.
     * Calculated by: (endTime - startTime) - totalPauseDuration.
     */
    duration: { type: Number, required: false, default: 0 },
  },
  {
    /**
     * Automatically manages `createdAt` and `updatedAt`.
     * Note: This replaces the manual `createdAt: { default: Date.now }`
     * definition you had before.
     */
    timestamps: true,
  },
);

// Optimize queries that filter by status or time ranges
activityLogSchema.index({ status: 1, startTime: 1, endTime: 1 });

export default mongoose.model<ActivityLogDocument>(
  "ActivityLog",
  activityLogSchema,
);
