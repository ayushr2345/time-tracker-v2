import { useState, useEffect, useCallback } from "react";
import { activityService } from "../../services";
import type { Activity, ActivityWithLogCount } from "../../types/activity";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import "react-toastify/dist/ReactToastify.css";
import { HTTP_STATUS } from "../../constants";

/**
 * Custom hook for managing activities data and operations.
 * @remarks
 * Handles fetching, creating, and deleting activities with comprehensive error handling.
 * Provides methods to refetch activities and manage the activities list.
 * @returns Object containing activities state and management methods
 * @returns activities            - Array of all activities with their log count
 * @returns loading               - Loading state
 * @returns refetch               - Function to refetch activities
 * @returns addActivity           - Function to create a new activity
 * @returns deleteActivity        - Function to delete an activity
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
   * @param newActivity           - Activity data to create (name and color)
   * @returns boolean             - True if activity was successfully created, false otherwise
   */
  const addActivity = async (newActivity: Omit<Activity, "_id">) => {
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
   * @param activityId            - The ID of the activity to delete
   * @returns boolean             - True if activity was successfully deleted, false otherwise
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

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return {
    activities,
    loading,
    refetch: fetchActivities,
    addActivity,
    deleteActivity,
  };
};

// TODO: add frontend and supporting backend to update activity name
