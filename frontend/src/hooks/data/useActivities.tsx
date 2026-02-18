import { useState, useEffect, useCallback } from "react";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import type {
  ActivityWithLogCount,
  CreateActivityPayload,
  UpdateActivityPayload,
} from "@time-tracker/shared";
import { activityService } from "../../services";
import { HTTP_STATUS } from "@time-tracker/shared";

/**
 * Custom hook for managing activities data and operations.
 * @remarks
 * Handles fetching, creating, updating, and deleting activities with comprehensive error handling.
 * Provides methods to refetch activities and manage the local activities list state.
 *
 * @returns An object containing:
 * - `activities`: Array of all activities with their log count.
 * - `loading`: Boolean indicating if data is being fetched.
 * - `refetch`: Function to manually re-trigger the fetch.
 * - `addActivity`: Function to create a new activity.
 * - `deleteActivity`: Function to delete an activity by ID.
 * - `updateActivity`: Function to update an existing activity.
 */
export const useActivities = () => {
  const [activities, setActivities] = useState<ActivityWithLogCount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Fetches all activities from the backend and updates state.
   */
  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const data = await activityService.getAllActivities();
      setActivities(data);
    } catch (err) {
      toast.error("Failed to fetch activities");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Creates a new activity with error handling and state update.
   * @param newActivity - Activity data to create (name and color).
   * @returns True if activity was successfully created, false otherwise.
   */
  const addActivity = async (newActivity: CreateActivityPayload) => {
    try {
      const savedActivity = await activityService.createActivity(newActivity);
      const savedActivityWithLogCount: ActivityWithLogCount = {
        ...savedActivity,
        logCount: 0,
      };
      setActivities((prev) => [...prev, savedActivityWithLogCount]);
      toast.success(`Activity "${savedActivity.name}" created!`);
      return true;
    } catch (error) {
      if (error instanceof AxiosError) {
        const statusCode = error.response?.status;
        if (statusCode === HTTP_STATUS.BAD_REQUEST) {
          toast.error("Invalid activity data provided.");
        } else if (statusCode === HTTP_STATUS.CONFLICT) {
          toast.error("An activity with this name already exists.");
        } else {
          toast.error(
            `Failed to create activity: ${error.response?.data?.message || error.message}`,
          );
        }
      } else {
        toast.error(`Failed to create activity: ${error}`);
      }
      console.log("Error creating activity:", error);
      return false;
    }
  };

  /**
   * Deletes an activity with error handling and state update.
   * @param activityId - The ID of the activity to delete.
   * @returns True if activity was successfully deleted, false otherwise.
   */
  const deleteActivity = async (activityId: string) => {
    try {
      await activityService.deleteActivity(activityId);
      setActivities((prev) => prev.filter((act) => act._id !== activityId));
      toast.success("Activity deleted successfully.");
      return true;
    } catch (error) {
      if (error instanceof AxiosError) {
        const statusCode = error.response?.status;
        if (statusCode === HTTP_STATUS.NOT_FOUND) {
          toast.error("Activity not found or already deleted.");
        } else if (statusCode === HTTP_STATUS.SERVER_ERROR) {
          toast.error("Error deleting activity on server.");
        } else {
          toast.error(
            `Failed to delete activity: ${error.response?.data?.message || error.message}`,
          );
        }
      } else {
        toast.error(`Failed to delete activity: ${error}`);
      }
      console.log("Error deleting activity:", error);
      return false;
    }
  };

  /**
   * Updates an activity with error handling and state update.
   * @param activityId - The activity id to be updated.
   * @param activity - The activity object containing updated name and color.
   * @returns True if activity was successfully updated, false otherwise.
   */
  const updateActivity = async (
    activityId: string,
    activity: UpdateActivityPayload,
  ) => {
    try {
      const updatedActivity = await activityService.updateActivity(
        activityId,
        activity,
      );
      // Note: We preserve the existing logCount since the update endpoint might not return it
      setActivities((prev) =>
        prev.map((a) =>
          a._id === updatedActivity._id
            ? { ...updatedActivity, logCount: a.logCount }
            : a,
        ),
      );
      toast.success("Activity updated successfully.");
      return true;
    } catch (error) {
      if (error instanceof AxiosError) {
        const statusCode = error.response?.status;
        if (statusCode === HTTP_STATUS.NOT_FOUND) {
          toast.error("Activity not found.");
        } else if (statusCode === HTTP_STATUS.SERVER_ERROR) {
          toast.error("Error updating activity on server.");
        } else {
          toast.error(
            `Failed to update activity: ${error.response?.data?.message || error.message}`,
          );
        }
      } else {
        toast.error(`Failed to update activity: ${error}`);
      }
      console.log("Error updating activity:", error);
      return false;
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return {
    activities,
    loading,
    refetch: fetchActivities,
    addActivity,
    deleteActivity,
    updateActivity,
  };
};
