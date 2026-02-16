/**
 * Service module for managing activity API calls.
 * @remarks
 * Handles all backend API interactions for activities (CRUD operations).
 * Provides methods for fetching, creating, updating, and deleting activities.
 */
import apiClient from "./apiClient";
import type {
  Activity,
  ActivityWithLogCount,
  CreateActivityPayload,
  UpdateActivityPayload,
} from "@time-tracker/shared";

export const activityService = {
  /**
   * Fetches all activities from the backend.
   * Includes metadata such as the count of logs associated with each activity.
   *
   * @returns A promise resolving to an array of activities with their log counts.
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
   * @returns The newly created Activity object.
   */
  createActivity: async (data: CreateActivityPayload): Promise<Activity> => {
    const response = await apiClient.post<Activity>(
      "/activities/createActivity",
      data,
    );
    return response.data;
  },

  /**
   * Updates an existing activity.
   *
   * @param activityId - The unique ID of the activity to update.
   * @param data - The fields to modify (name, color).
   * @returns The updated Activity object.
   */
  updateActivity: async (
    activityId: string,
    updatedData: UpdateActivityPayload,
  ): Promise<Activity> => {
    const response = await apiClient.patch<Activity>(
      `/activities/updateActivity/${activityId}`,
      updatedData,
    );
    return response.data;
  },

  /**
   * Deletes an activity from the backend.
   *
   * @param activityId - The unique identifier of the activity to delete.
   * @returns A promise resolving to a success message from the backend.
   */
  deleteActivity: async (activityId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      `/activities/deleteActivity/${activityId}`,
    );
    return response.data;
  },
};
