/**
 * Service module for managing activity log API calls.
 * @remarks
 * Handles all backend API interactions for activity logs and timers.
 * Provides methods for CRUD operations and timer-specific actions.
 */
import apiClient from "./apiClient";
import type { ActivityLogEntry } from "../types/activityLog";
import type { ActivityLogsWithDetails } from "../types/activityLog";

export const activityLogService = {
  /**
   * Fetches all activity logs from the backend.
   *
   * @returns {Promise<ActivityLogsWithDetails[]>} A promise resolving to an array of all activity log entries
   *                                               along with their name and color.
   */
  getAllActivityLogs: async (): Promise<ActivityLogsWithDetails[]> => {
    const response = await apiClient.get<ActivityLogsWithDetails[]>(
      "/activity-logs/getActivityLogs",
    );
    return response.data;
  },

  /**
   * Creates a new manual activity log entry.
   * Useful for backfilling work that was not tracked with a live timer.
   *
   * @param activityId - The unique identifier of the activity to log against.
   * @param startTime  - The Date object representing when the activity started.
   * @param endTime    - The Date object representing when the activity ended.
   * @returns          - A promise that resolves to the newly created ActivityLogEntry.
   */
  createManualLogEntry: async (
    activityId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<ActivityLogEntry> => {
    const response = await apiClient.post<ActivityLogEntry>(
      `/activity-logs/createManualEntryLog/${activityId}`,
      {
        startTime,
        endTime,
      },
    );
    return response.data;
  },

  /**
   * Starts a new active timer for a specific activity.
   *
   * @param activityId - The ID of the activity to start tracking.
   * @param startTime  - Optional: Start time of a log entry (used for split timer)
   * @returns          - A promise resolving to the new "active" activity log entry.
   */
  startTimer: async (
    activityId: string,
    startTime?: Date,
  ): Promise<ActivityLogEntry> => {
    const response = await apiClient.post<ActivityLogEntry>(
      `/activity-logs/startTimer/${activityId}`,
      startTime ? { startTime } : {},
    );
    return response.data;
  },

  /**
   * Stops a running timer and marks it as completed.
   *
   * @param activityLogId - The ID of the active log entry to finalize.
   * @param endTime       - Optional: End time of a log entry (used for split timer)
   * @returns             - A promise resolving to the completed log entry with the final duration.
   */
  stopTimer: async (
    activityLogId: string,
    endTime?: Date,
  ): Promise<ActivityLogEntry> => {
    const response = await apiClient.patch<ActivityLogEntry>(
      `/activity-logs/stopTimer/${activityLogId}`,
      endTime ? { endTime } : {},
    );
    return response.data;
  },

  /**
   * Pauses a currently running timer.
   *
   * @param activityLogId - The ID of the active log entry to pause.
   * @returns             - A promise resolving to the updated log entry with status "paused".
   */
  pauseTimer: async (activityLogId: string): Promise<ActivityLogEntry> => {
    const response = await apiClient.patch<ActivityLogEntry>(
      `/activity-logs/pauseTimer/${activityLogId}`,
    );
    return response.data;
  },

  /**
   * Resumes a previously paused timer.
   *
   * @param activityLogId - The ID of the paused log entry to resume.
   * @returns             - A promise resolving to the updated log entry with status "active".
   */
  resumeTimer: async (activityLogId: string): Promise<ActivityLogEntry> => {
    const response = await apiClient.patch<ActivityLogEntry>(
      `/activity-logs/resumeTimer/${activityLogId}`,
    );
    return response.data;
  },

  /**
   * Sends a heartbeat to update the "last active" timestamp.
   * Used to distinguish between a user who is still working and a browser crash.
   *
   * @param activityLogId - The ID of the active log to update.
   * @returns             - A promise resolving to the updated log entry.
   */
  sendHeartbeat: async (activityLogId: string): Promise<ActivityLogEntry> => {
    const response = await apiClient.patch<ActivityLogEntry>(
      `/activity-logs/sendHeartbeat/${activityLogId}`,
    );
    return response.data;
  },

  /**
   * Discards a timer completely without saving the duration.
   * This is a destructive action (DELETE).
   *
   * @param activityLogId - The ID of the log entry to delete.
   * @returns             - A promise resolving to the deleted log data.
   */
  resetTimer: async (activityLogId: string): Promise<ActivityLogEntry> => {
    const response = await apiClient.delete<ActivityLogEntry>(
      `/activity-logs/resetTimer/${activityLogId}`,
    );
    return response.data;
  },

  /**
   * Attempts to recover a timer that was interrupted (e.g., by a browser crash).
   * Typically resumes the session based on the last known heartbeat or pause state.
   *
   * @param activityLogId - The ID of the crashed log entry to recover.
   * @returns             - A promise resolving to the recovered log entry.
   */
  resumeCrashedTimer: async (
    activityLogId: string,
  ): Promise<ActivityLogEntry> => {
    const response = await apiClient.patch<ActivityLogEntry>(
      `/activity-logs/resumeCrashedTimer/${activityLogId}`,
    );
    return response.data;
  },
};
