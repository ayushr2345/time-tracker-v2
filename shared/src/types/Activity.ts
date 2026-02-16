/**
 * @fileoverview Shared Type Definitions for Activities.
 * This file defines the "Pure Data" shapes used across the full stack.
 * It strictly avoids Node.js/Mongoose dependencies to remain lightweight for the Frontend.
 */

/**
 * Represents the core Activity entity.
 * * @remarks
 * This interface defines the shape of an activity as it is stored in the database
 * and transmitted via the API. It is the "Source of Truth" for an activity object.
 * * @example
 * ```ts
 * const coding: Activity = {
 * _id: "507f1f77bcf86cd799439011",
 * name: "Coding",
 * color: "#3B82F6",
 * createdAt: new Date("2024-01-01"),
 * updatedAt: new Date("2024-01-05")
 * };
 * ```
 */
export interface Activity {
  /** * The unique MongoDB document identifier.
   * @remarks Handled as a string in the shared layer to avoid Mongoose ObjectId dependency.
   */
  _id: string;

  /** * The display name of the activity.
   * @remarks Must be unique and is case-insensitive during lookup.
   * @example "Coding", "Reading", "Gym"
   */
  name: string;

  /** * The hex color code used for UI badges, charts, and categorization.
   * @remarks Defaults to a system constant if not provided.
   * @example "#FF5733" (Orange), "#10B981" (Emerald)
   */
  color: string;

  /**
   * The timestamp when the activity was originally created.
   * @remarks
   * - Automatically managed by the Mongoose `timestamps: true` option.
   * - Useful for sorting activities by "Newest First".
   */
  createdAt: Date;

  /**
   * The timestamp when the activity details (name/color) were last modified.
   * @remarks
   * - Automatically updated by Mongoose whenever `save()` is called.
   */
  updatedAt: Date;
}

/**
 * An extended Activity object that includes computed runtime statistics.
 * * @remarks
 * This interface is used primarily in **Overview** where the backend
 * performs an aggregation (lookup/count) before sending data to the client.
 * The `logCount` property is **transient** (calculated on-the-fly) and is NOT stored in the Activity collection.
 */
export interface ActivityWithLogCount extends Activity {
  /** * The total number of logs associated with this activity.
   * @readonly Computed via MongoDB aggregation pipeline.
   */
  logCount: number;
}

/**
 * Payload for creating a new activity.
 * @remarks
 * We omit system-managed fields (_id, createdAt, updatedAt)
 * because the client should not send them.
 */
export type CreateActivityPayload = Omit<
  Activity,
  "_id" | "createdAt" | "updatedAt"
>;

/**
 * Payload for updating an existing activity.
 * @remarks
 * - We use Partial<CreateActivityPayload> because you might only want to update the name
 * OR the color, not necessarily both.
 * - We strictly exclude _id and timestamps so the client can't tamper with them.
 */
export type UpdateActivityPayload = Partial<CreateActivityPayload>;
