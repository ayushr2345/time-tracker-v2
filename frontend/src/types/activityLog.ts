/**
 * Type definitions for ActivityLogEntry objects.
 * @remarks
 * Represents a single time record in the database.
 * This entity handles both simple duration logs (manual) and complex, stateful timer sessions.
 */

/**
 * Represents a specific pause interval within a timer session.
 * Used to calculate the net duration by subtracting these gaps from the gross start/end time.
 */
export interface PauseInterval {
  /** The moment the user hit "Pause" */
  pauseTime: Date;

  /** * The moment the user hit "Resume".
   * @optional Undefined if the timer is currently paused and hasn't resumed yet.
   */
  resumeTime?: Date;
}

/**
 * Represents a time log entry as stored in the database.
 * Tracks the lifecycle of a time tracking session from start to completion.
 */
export interface ActivityLogEntry {
  /** The unique MongoDB document identifier */
  _id: string;

  /** The ID of the parent Activity this log belongs to */
  activityId: string;

  /** The timestamp when this record was created */
  createdAt: Date;

  /** The precise moment the timer started or the manual entry began */
  startTime: Date;

  /** * The precise moment the timer stopped.
   * @optional Undefined if the timer is currently running or paused.
   */
  endTime?: Date;

  /**
   * The source of the log entry.
   * - `manual`: User added a block of time directly.
   * - `timer`: Created via the live stopwatch feature.
   */
  entryType: "manual" | "timer";

  /**
   * The current state of the timer.
   * - `active`: Clock is ticking.
   * - `paused`: Clock is stopped, waiting to resume.
   * - `completed`: Session is finished and saved.
   */
  status: "active" | "completed" | "paused";

  /**
   * Audit trail of all pause/resume actions.
   * Critical for calculating the exact `duration` by subtracting these intervals.
   */
  pauseHistory?: PauseInterval[];

  /**
   * The calculated net duration in seconds.
   * @optional Calculated upon completion.
   */
  duration?: number;

  /**
   * The last known timestamp the client reported "I am alive".
   * Used for "Zombie Protocol" to detect if the browser crashed while a timer was running.
   */
  lastHeartbeat: Date;
}

/**
 * An extended ActivityLogEntry object that includes activity name and color.
 * Used primarily in Activity Logs component to display name and color
 * @extends ActivityLogEntry
 */
export interface ActivityLogsWithDetails extends ActivityLogEntry {
  /** * The name and color associated with the activity.
   * @readonly Returned via controller (not stored in DB).
   */
  activityName: string;
  activityColor: string;
}
