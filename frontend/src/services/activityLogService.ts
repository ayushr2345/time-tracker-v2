import apiClient from "./apiClient";
import type { ActivityLogEntry } from "../types/activityLog";

export interface CreateManualEntryLog {
  activityId: string,
  startTime: Date,
  endTime: Date
};

export const activityLogService = {
  getAllActivityLogs: async (): Promise<ActivityLogEntry[]> => {
    const response = await apiClient.get<ActivityLogEntry[]>(
      "/activity-logs/getActivityLogs",
    );
    return response.data;
  },

  createManualEntryLog: async (
    data: CreateManualEntryLog,
  ): Promise<ActivityLogEntry> => {
    const response = await apiClient.post<ActivityLogEntry>(
      "/activity-logs/createManualEntryLog",
      data,
    );
    return response.data;
  },
};
