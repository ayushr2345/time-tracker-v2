/**
 * Type definitions for ActivityLogEntry objects.
 * @remarks
 * Represents a time log entry for a tracked activity.
 * Can be either a manual entry or a timer-based entry with various states.
 */

// Types for saved time records (Activity Log entries)
export type ActivityLogEntry = {
  _id: string;
  activityId: string;
  createdAt: Date;
  startTime: Date;
  endTime: Date;
  lastHeartbeat: Date;
  entrytype: "manual" | "timer";
  status: "active" | "completed" | "paused";
  pauseHistory?: Array<{
    pauseTime: Date;
    resumeTime: Date;
  }>;
  duration?: number; // in seconds
};
