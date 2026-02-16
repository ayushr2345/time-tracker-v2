/**
 * @fileoverview Shared Type Definitions for Activity Logs.
 * This file defines the data structures for tracking time sessions.
 * It handles both simple manual entries and complex, stateful timer sessions with pause/resume support.
 */

/**
 * Represents a specific pause interval within a timer session.
 * @remarks
 * Used to calculate the **Net Duration** of a session.
 * Formula: `(EndTime - StartTime) - Sum(ResumeTime - PauseTime)`
 */
export interface PauseInterval {
  /** * The precise timestamp when the user clicked "Pause".
   * This marks the beginning of a non-counted interval.
   */
  pauseTime: Date;

  /** * The precise timestamp when the user clicked "Resume".
   * @remarks
   * - If `undefined`, the timer is currently in a PAUSED state.
   * - Must be present for any completed pause interval.
   */
  resumeTime?: Date;
}

/**
 * Represents a time log entry as stored in the database.
 * @remarks
 * Tracks the entire lifecycle of a session:
 * 1. Creation (`startTime`)
 * 2. Active updates (`lastHeartbeat`)
 * 3. Pause intervals (`pauseHistory`)
 * 4. Completion (`endTime`, `duration`)
 */
export interface ActivityLogEntry {
  /** The unique MongoDB document identifier. */
  _id: string;

  /** * The ID of the parent Activity this log belongs to.
   * @remarks References the `_id` field of an {@link Activity}.
   */
  activityId: string;

  /** * The anchor timestamp for the session start.
   * @remarks For manual entries, this is the user-selected start time.
   * For timers, this is when the "Start" button was clicked.
   */
  startTime: Date;

  /** * The timestamp when the session was finished.
   * @remarks
   * - `undefined`: Session is currently Running or Paused.
   * - `Date`: Session is Completed.
   */
  endTime?: Date;

  /**
   * The origin of this time log.
   * - `manual`: User retroactively added a block of time.
   * - `timer`: Created via the live stopwatch feature.
   */
  entryType: "manual" | "timer";

  /**
   * The current operational state of the session.
   * @remarks
   * - `active`: Clock is ticking; `lastHeartbeat` is updating.
   * - `paused`: Clock is stopped; waiting for user action.
   * - `completed`: Session is finalized and read-only.
   */
  status: "active" | "completed" | "paused";

  /**
   * Audit trail of all pause/resume actions.
   * @remarks
   * Critical for calculating accurate duration. The sum of these intervals
   * is subtracted from the total elapsed time.
   */
  pauseHistory?: PauseInterval[];

  /**
   * The calculated net duration in **seconds**.
   * @remarks
   * - For `manual`: Calculated immediately upon creation.
   * - For `timer`: Calculated only when `status` becomes `completed`.
   */
  duration?: number;

  /**
   * The "Pulse" of the active timer.
   * @remarks
   * Updated every minute by the client while the timer is running.
   * Used for the **Zombie Protocol**: If `lastHeartbeat` is > 5 mins old,
   * the server assumes the browser crashed and auto-stops the timer.
   */
  lastHeartbeat: Date;

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
 * An extended Log object that includes joined Activity details.
 * @remarks
 * Used primarily in **History Views** and **Tables** where we need to display
 * the Activity's name and color without fetching the Activity document separately.
 * @extends ActivityLogEntry
 */
export interface ActivityLogsWithDetails extends ActivityLogEntry {
  /** * The display name of the parent activity.
   * @readonly Populated via MongoDB `$lookup` (not stored in ActivityLog collection).
   */
  activityName: string;

  /** * The hex color code of the parent activity.
   * @readonly Populated via MongoDB `$lookup`.
   */
  activityColor: string;
}

/**
 * Payload for creating a new activity log (Manual).
 * @remarks
 * The client only needs to provide:
 * 1. Which activity? (activityId)
 * 2. When did it start? (startTime)
 * 3. When did it end? (endTime)
 * * Everything else (entry type, status, duration, pauseHistory) is handled by the backend defaults.
 */
export type CreateManualActivityLogPayload = Pick<
  ActivityLogEntry,
  "activityId" | "startTime" | "endTime"
>;

/**
 * Payload for creating a new activity log (Timer).
 * @remarks
 * The client only needs to provide:
 * 1. Which activity? (activityId)
 * * Everything else (entry type, status, duration, pauseHistory) is handled by the backend defaults.
 */
export type CreateTimerActivityLogPayload = Pick<
  ActivityLogEntry,
  "activityId"
> & {
  // Optional overrides if you want to support them
  startTime?: Date;
};

/**
 * Payload for stopping timer for an activity log (Timer).
 * @remarks
 * The client only needs to provide:
 * 1. Which log? (ActivityLogEntry._id)
 * * Everything else (entry type, status, duration, pauseHistory) is handled by the backend defaults.
 */
export type StopTimerActivityLogPayload = Pick<ActivityLogEntry, "_id"> & {
  // Optional overrides if you want to support them
  endTime?: Date;
};
