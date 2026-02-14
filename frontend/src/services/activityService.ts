/**
 * Service module for managing activity API calls.
 * @remarks
 * Handles all backend API interactions for activities (CRUD operations).
 * Provides methods for fetching, creating, updating, and deleting activities.
 */
import apiClient from "./apiClient";
import type { Activity, ActivityWithLogCount } from "../types/activity";

export const activityService = {
  /**
   * Fetches all activities from the backend.
   * Includes metadata such as the count of logs associated with each activity.
   *
   * @returns {Promise<ActivityWithLogCount[]>} A promise resolving to an array of activities with their log counts.
   */
  getAllActivities: async (): Promise<ActivityWithLogCount[]> => {
    const response = await apiClient.get<ActivityWithLogCount[]>(
      "/activities/getActivities",
    );
    return response.data;
  },

  /**
   * Creates a new activity on the backend.
   *
   * @param data - The activity payload containing the name and color (excludes ID).
   * @returns    - A promise resolving to the newly created Activity object.
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
   *
   * @param activityId  - The unique identifier of the activity to update.
   * @param updatedData - A partial object containing the fields to modify (e.g., name or color).
   * @returns           - A promise resolving to the updated Activity object.
   */
  updateActivity: async (updatedData: Activity): Promise<Activity> => {
    const response = await apiClient.patch<Activity>(
      `/activities/updateActivity/${updatedData._id}`,
      updatedData,
    );
    return response.data;
  },

  /**
   * Deletes an activity from the backend.
   *
   * @param activityId - The unique identifier of the activity to delete.
   * @returns          - A promise resolving to a success message from the backend.
   */
  deleteActivity: async (activityId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      `/activities/deleteActivity/${activityId}`,
    );
    return response.data;
  },
};
