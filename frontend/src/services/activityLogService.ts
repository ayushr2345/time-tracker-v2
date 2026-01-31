import apiClient from "./apiClient";
import type { ActivityLogEntry } from "../types/activityLog";

export const activityLogService = {
  getAllActivityLogs: async (): Promise<ActivityLogEntry[]> => {
    const response = await apiClient.get<ActivityLogEntry[]>(
      "/activity-logs/getActivityLogs",
    );
    return response.data;
  },

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

  startTimer: async (activityId: string): Promise<ActivityLogEntry> => {
    const response = await apiClient.post<ActivityLogEntry>(
      "/activity-logs/startTimer",
      { activityId },
    );
    return response.data;
  },

  stopTimer: async (activityLogId: string): Promise<ActivityLogEntry> => {
    const response = await apiClient.put<ActivityLogEntry>(
      "/activity-logs/stopTimer",
      { activityLogId },
    );
    return response.data;
  },

  pauseTimer: async (activityLogId: string): Promise<ActivityLogEntry> => {
    const response = await apiClient.put<ActivityLogEntry>(
      "/activity-logs/pauseTimer",
      { activityLogId },
    );
    return response.data;
  },

  resumeTimer: async (activityLogId: string): Promise<ActivityLogEntry> => {
    const response = await apiClient.put<ActivityLogEntry>(
      "/activity-logs/resumeTimer",
      { activityLogId },
    );
    return response.data;
  },

  sendHeartbeat: async (activityLogId: string): Promise<ActivityLogEntry> => {
    const response = await apiClient.put<ActivityLogEntry>(
      "/activity-logs/sendHeartbeat",
      { activityLogId },
    );
    return response.data;
  },

  resetTimer: async (activityLogId: string): Promise<ActivityLogEntry> => {
    const response = await apiClient.delete<ActivityLogEntry>(
      "/activity-logs/resetTimer",
      { data: { activityLogId } },
    );
    return response.data;
  },

  resumeCrashedTimer: async (activityLogId: string): Promise<ActivityLogEntry> => {
    const response = await apiClient.put<ActivityLogEntry>(
      "/activity-logs/resumeCrashedTimer",
      { activityLogId },
    );
    return response.data;
  },
};
