/**
 * Type definitions for Activity objects.
 * @remarks
 * Represents a trackable activity in the time tracking system.
 */

/**
 * Represents a trackable activity entity as stored in the database.
 * Each activity has a unique identifier, name, and associated color for display.
 */
export interface Activity {
  /** The unique MongoDB document identifier */
  _id: string;

  /** The display name of the activity (e.g., "Coding", "Gym") */
  name: string;

  /** * The hex color code or string used for UI badges and charts.
   * @example "#FF5733" or "blue"
   */
  color: string;
}

/**
 * An extended Activity object that includes computed runtime statistics.
 * Used primarily in dashboards and list views where aggregation is performed.
 * @extends Activity
 */
export interface ActivityWithLogCount extends Activity {
  /** * The total number of logs associated with this activity.
   * @readonly Computed via MongoDB aggregation pipeline (not stored in DB).
   */
  logCount: number;
}
