/**
 * Service module for managing activity log API calls.
 * @remarks
 * Handles all backend API interactions for activity logs and timers.
 * Provides methods for CRUD operations and timer-specific actions.
 */
import apiClient from "./apiClient";
import type { ActivityLogEntry } from "../types/activityLog";

export const activityLogService = {
  /**
   * Fetches all activity logs from the backend.
   * @returns Promise<ActivityLogEntry[]>  - Resolves to array of all activity log entries
   */
  getAllActivityLogs: async (): Promise<ActivityLogEntry[]> => {
    const response = await apiClient.get<ActivityLogEntry[]>(
      "/activity-logs/getActivityLogs",
    );
    return response.data;
  },

  /**
   * Creates a new manual activity log entry.
   * @param activityId                       - The activity ID for this log entry
   * @param startTime                        - When the activity started
   * @param endTime                          - When the activity ended
   * @returns Promise<ActivityLogEntry>     - Resolves to the created activity log entry
   */
  createManualLogEntry: async (
    activityId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<ActivityLogEntry> => {
    const response = await apiClient.post<ActivityLogEntry>(
      "/activity-logs/createManualEntry",
      {
        activityId,
        startTime,
        endTime,
      },
    );
    return response.data;
  },

  /**
   * Starts a new timer for an activity.
   * @param activityId                       - The activity ID to start timer for
   * @returns Promise<ActivityLogEntry>     - Resolves to the started activity log entry
   */
  startTimer: async (activityId: string): Promise<ActivityLogEntry> => {
    const response = await apiClient.post<ActivityLogEntry>(
      "/activity-logs/startTimer",
      { activityId },
    );
    return response.data;
  },

  /**
   * Stops a running timer and logs the activity.
   * @param activityLogId                    - The activity log ID to stop
   * @returns Promise<ActivityLogEntry>     - Resolves to stopped activity log entry with final duration
   */
  stopTimer: async (activityLogId: string): Promise<ActivityLogEntry> => {
    const response = await apiClient.put<ActivityLogEntry>(
      "/activity-logs/stopTimer",
      { activityLogId },
    );
    return response.data;
  },

  /**
   * Pauses a running timer.
   * @param activityLogId                    - The activity log ID to pause
   * @returns Promise<ActivityLogEntry>     - Resolves to the paused activity log entry
   */
  pauseTimer: async (activityLogId: string): Promise<ActivityLogEntry> => {
    const response = await apiClient.put<ActivityLogEntry>(
      "/activity-logs/pauseTimer",
      { activityLogId },
    );
    return response.data;
  },

  /**
   * Resumes a paused timer.
   * @param activityLogId                    - The activity log ID to resume
   * @returns Promise<ActivityLogEntry>     - Resolves to the resumed activity log entry
   */
  resumeTimer: async (activityLogId: string): Promise<ActivityLogEntry> => {
    const response = await apiClient.put<ActivityLogEntry>(
      "/activity-logs/resumeTimer",
      { activityLogId },
    );
    return response.data;
  },

  /**
   * Sends a heartbeat for an active timer to detect crashes.
   * @param activityLogId                    - The activity log ID to send heartbeat for
   * @returns Promise<ActivityLogEntry>     - Resolves to the updated activity log entry
   */
  sendHeartbeat: async (activityLogId: string): Promise<ActivityLogEntry> => {
    const response = await apiClient.put<ActivityLogEntry>(
      "/activity-logs/sendHeartbeat",
      { activityLogId },
    );
    return response.data;
  },

  /**
   * Resets/discards a timer without logging any time.
   * @param activityLogId                    - The activity log ID to reset
   * @returns Promise<ActivityLogEntry>     - Resolves to response after timer reset
   */
  resetTimer: async (activityLogId: string): Promise<ActivityLogEntry> => {
    const response = await apiClient.delete<ActivityLogEntry>(
      "/activity-logs/resetTimer",
      { data: { activityLogId } },
    );
    return response.data;
  },

  /**
   * Attempts to recover a timer that may have crashed or lost connection.
   * @param activityLogId                    - The activity log ID to resume
   * @returns Promise<ActivityLogEntry>     - Resolves to the recovered activity log entry
   */
  resumeCrashedTimer: async (
    activityLogId: string,
  ): Promise<ActivityLogEntry> => {
    const response = await apiClient.put<ActivityLogEntry>(
      "/activity-logs/resumeCrashedTimer",
      { activityLogId },
    );
    return response.data;
  },
};
