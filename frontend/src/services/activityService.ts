/**
 * Service module for managing activity API calls.
 * @remarks
 * Handles all backend API interactions for activities (CRUD operations).
 * Provides methods for fetching, creating, updating, and deleting activities.
 */
import apiClient from "./apiClient";
import type { Activity } from "../types/activity";

export const activityService = {
  /**
   * Fetches all activities from the backend.
   * @returns Promise<Activity[]>  - Resolves to array of all activities
   */
  getAllActivities: async (): Promise<Activity[]> => {
    const response = await apiClient.get<Activity[]>(
      "/activities/getActivities",
    );
    return response.data;
  },

  /**
   * Creates a new activity on the backend.
   * @param data                 - Activity data to create (name and color)
   * @returns Promise<Activity>  - Resolves to the created activity with ID
   */
  createActivity: async (data: Omit<Activity, "_id">): Promise<Activity> => {
    const response = await apiClient.post<Activity>(
      "/activities/createActivity",
      data,
    );
    return response.data;
  },

  /**
   * Updates an existing activity on the backend.
   * @param activityId           - The activity ID to update
   * @param updatedData          - Partial activity data to update
   * @returns Promise<Activity>  - Resolves to the updated activity
   */
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

  /**
   * Deletes an activity from the backend.
   * @param activityId                        - The activity ID to delete
   * @returns Promise<{ message: string }>   - Resolves to response message from backend
   */
  deleteActivity: async (activityId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      `/activities/deleteActivity/${activityId}`,
    );
    return response.data;
  },
};
