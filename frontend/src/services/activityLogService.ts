import apiClient from "./apiClient";
import type { ActivityLogEntry } from "../types/activityLog";

export const activityLogService = {
  getAllActivityLogs: async (): Promise<ActivityLogEntry[]> => {
    const response = await apiClient.get<ActivityLogEntry[]>(
      "/activityLogs/getActivityLogs",
    );
    return response.data;
  },
  createActivityLog: async (
    data: Omit<ActivityLogEntry, "_id">,
  ): Promise<ActivityLogEntry> => {
    const response = await apiClient.post<ActivityLogEntry>(
      "/activityLogs/createActivityLog",
      data,
    );
    return response.data;
  },
  updateActivityLog: async (
    activityLogId: string,
    updatedData: Partial<ActivityLogEntry>,
  ): Promise<ActivityLogEntry> => {
    const response = await apiClient.put<ActivityLogEntry>(
      `/activityLogs/updateActivityLog/${activityLogId}`,
      updatedData,
    );
    return response.data;
  },
  deleteActivityLog: async (
    activityLogId: string,
  ): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      `/activityLogs/deleteActivityLog/${activityLogId}`,
    );
    return response.data;
  },
};
