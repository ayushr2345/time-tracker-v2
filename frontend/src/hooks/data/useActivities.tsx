import { useState, useEffect, useCallback } from "react";
import { activityService } from "../../services";
import type { Activity } from "../../types/activity";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import "react-toastify/dist/ReactToastify.css";

export const useActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  const addActivity = async (newActivity: Omit<Activity, "_id">) => {
    try {
      const savedActivity = await activityService.createActivity(newActivity);
      setActivities((prev) => [...prev, savedActivity]);
      toast.success(`Activity "${savedActivity.name}" created!`);
      return true;
    } catch (error) {
      if (error instanceof AxiosError) {
        const statusCode = error.response?.status;
        if (statusCode === 400) {
          toast.error("Invalid activity data provided.");
        } else if (statusCode === 409) {
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

  const deleteActivity = async (activityId: string) => {
    try {
      await activityService.deleteActivity(activityId);
      setActivities((prev) => prev.filter((act) => act._id !== activityId));
      toast.success("Activity deleted successfully.");
      return true;
    } catch (error) {
      if (error instanceof AxiosError) {
        const statusCode = error.response?.status;
        if (statusCode === 404) {
          toast.error("Activity not found or already deleted.");
        } else if (statusCode === 500) {
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
