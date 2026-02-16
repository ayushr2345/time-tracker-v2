import mongoose, { Schema, Document } from "mongoose";
import { APP_CONFIG } from "../constants.js";
import { Activity } from "@time-tracker/shared";

/**
 * @fileoverview Mongoose Model for Activity.
 * Bridges the Shared Interface (Pure Data) with Mongoose Functionality.
 */

/**
 * Mongoose Document Interface for Activity.
 * @remarks
 * Combines:
 * 1. {@link Activity} (Shared) - Inherits name, color, createdAt, and updatedAt.
 * 2. {@link Document} (Mongoose) - Inherits _id, save(), and other DB methods.
 * * We use `Omit<Activity, "_id">` because Mongoose's `_id` (ObjectId)
 * conflicts with the Shared `_id` (string).
 */
export interface ActivityDocument extends Omit<Activity, "_id">, Document {
  // No need to manually add createdAt/updatedAt; they are inherited from Activity!
}

/**
 * Activity Schema Definition
 * @remarks
 * Defines the database-level validation and constraints.
 */
const activitySchema = new Schema<ActivityDocument>(
  {
    /**
     * The display name of the activity.
     * @remarks
     * - **Required**: Cannot be null/empty.
     * - **Trimmed**: Whitespace removed from ends.
     * - **Unique**: Enforced case-insensitively (e.g., "Gym" == "gym").
     */
    name: {
      type: String,
      required: true,
      trim: true,
      index: {
        unique: true,
        collation: { locale: "en", strength: 2 },
      },
    },

    /**
     * The hex color code.
     * @remarks
     * - **Required**: Must exist.
     * - **Default**: Falls back to `APP_CONFIG.DEFAULT_ACTIVITY_COLOR` if not provided.
     */
    color: {
      type: String,
      required: true,
      default: APP_CONFIG.DEFAULT_ACTIVITY_COLOR,
    },
  },
  {
    /**
     * Automating Timestamps
     * @remarks
     * Mongoose will automatically populate `createdAt` and `updatedAt`
     * to match the fields defined in our Shared {@link Activity} interface.
     */
    timestamps: true,
  },
);

/**
 * The Activity Model.
 * Interactions with the "activities" collection in MongoDB.
 */
export default mongoose.model<ActivityDocument>("Activity", activitySchema);
