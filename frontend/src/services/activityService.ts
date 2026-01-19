import apiClient from "./apiClient";
import type { Activity } from "../types/activity";

export const activityService = {
  getAllActivities: async (): Promise<Activity[]> => {
    const response = await apiClient.get<Activity[]>(
      "/activities/getActivities",
    );
    return response.data;
  },
  createActivity: async (data: Omit<Activity, "_id">): Promise<Activity> => {
    const response = await apiClient.post<Activity>(
      "/activities/createActivity",
      data,
    );
    return response.data;
  },
  updateActivity: async (
    activityId: string,
    updatedData: Partial<Activity>,
  ): Promise<Activity> => {
    const response = await apiClient.put<Activity>(
      `/activities/updateActivity/${activityId}`,
      updatedData,
    );
    return response.data;
  },
  deleteActivity: async (activityId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      `/activities/deleteActivity/${activityId}`,
    );
    return response.data;
  },
};

// TODO: make it more robust with better error handling and possibly retries
// TODO: make it as a service
