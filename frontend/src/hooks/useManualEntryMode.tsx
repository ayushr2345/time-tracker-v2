import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { activityService } from "../services/activityService";
import type { Activity } from "../types/activity";

export const useManualEntryMode = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedActivityId, setSelectedActivityId] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("today");
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");

  const handleChangeDay = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDay(e.target.value);
  };

  const handleChangeActivity = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedActivityId(e.target.value);
  };

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

  const validateInputs = (): boolean => {
    if (!selectedActivityId) {
      toast.error("Please select an activity to save the manual entry.");
      return false;
    }
    if (!startTime || !endTime) {
      toast.error("Please provide both start and end times.");
      return false;
    }

    const startTimeDate = new Date();
    startTimeDate.setHours(parseInt(startTime.split(":")[0], 10));
    startTimeDate.setMinutes(parseInt(startTime.split(":")[1], 10));

    const endTimeDate = new Date();
    endTimeDate.setHours(parseInt(endTime.split(":")[0], 10));
    endTimeDate.setMinutes(parseInt(endTime.split(":")[1], 10));

    if (selectedDay === "yesterday") {
      startTimeDate.setDate(startTimeDate.getDate() - 1);
      endTimeDate.setDate(endTimeDate.getDate() - 1);
    }

    const currentTime = new Date();
    if (startTimeDate > currentTime) {
      toast.error("Start time cannot be in the future.");
      return false;
    }
    if (endTimeDate > currentTime) {
      toast.error("End time cannot be in the future.");
      return false;
    }
    if (startTimeDate >= endTimeDate) {
      toast.error("End time must be after start time.");
      return false;
    }

    const fiveMinutes = 5 * 60 * 1000;
    const twentyFourHours = 24 * 60 * 60 * 1000;

    const duration = endTimeDate.getTime() - startTimeDate.getTime();
    if (duration < fiveMinutes) {
      toast.error("At least 5 minutes of activity duration is required.");
      return false;
    }
    if (duration > twentyFourHours) {
      toast.error("Activity duration cannot exceed 24 hours.");
      return false;
    }

    return true;
  };

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return {
    activities,
    loading,
    selectedActivityId,
    setSelectedActivityId,
    selectedDay,
    setSelectedDay,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    handleChangeActivity,
    handleChangeDay,
    validateInputs,
    refetch: fetchActivities,
  };
};
