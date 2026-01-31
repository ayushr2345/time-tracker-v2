import { useState, useEffect, useCallback } from "react";
import { activityLogService } from "../../services";
import type { ActivityLogEntry } from "../../types/activityLog";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import "react-toastify/dist/ReactToastify.css";
import { useActivities } from "./useActivities";

export const useActivityLog = () => {
  const { activities } = useActivities();
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchActivityLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await activityLogService.getAllActivityLogs();
      setActivityLogs(data);
    } catch (err) {
      toast.error("Failed to fetch activities");
    } finally {
      setLoading(false);
    }
  }, []);

  const createManualLogEntry = async (
    activityId: string,
    startTime: Date,
    endTime: Date,
  ) => {
    try {
      const savedActivityLog = await activityLogService.createManualLogEntry(
        activityId,
        startTime,
        endTime,
      );
      setActivityLogs((prev) => [savedActivityLog, ...prev]);
      const activityName = activities.find((a) => a._id === activityId)?.name;
      toast.success(
        `Activity Log entry for "${activityName}" and duration ${savedActivityLog.duration} created!`,
      );
      return savedActivityLog;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMsg = error.response?.data?.error || error.message;
        if (error.response?.status === 400 || error.response?.status === 409) {
          toast.error(serverMsg);
        } else {
          toast.error(`Failed: ${serverMsg}`);
        }
      } else {
        toast.error(`Failed to create activity: ${error}`);
      }
      console.log("Error creating activity:", error);
      return null;
    }
  };

  const startTimer = async (activityId: string) => {
    try {
      const startTimerLog = await activityLogService.startTimer(activityId);
      setActivityLogs((prev) => [startTimerLog, ...prev]);
      const activityName = activities.find((a) => a._id === activityId)?.name;
      toast.success(`Started timer for "${activityName}"!`);
      return startTimerLog;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMsg = error.response?.data?.error || error.message;
        if (error.response?.status === 400 || error.response?.status === 409) {
          toast.error(serverMsg);
        } else {
          toast.error(`Failed: ${serverMsg}`);
        }
      } else {
        toast.error(`Failed to create activity: ${error}`);
      }
      console.log("Error creating activity:", error);
      return null;
    }
  };

  const stopTimer = async (activityLogId: string) => {
    try {
      const endTimerLog = await activityLogService.stopTimer(activityLogId);
      setActivityLogs((prev) =>
        prev.map((log) => (log._id === activityLogId ? endTimerLog : log)),
      );
      const activityName = activities.find(
        (a) => a._id === endTimerLog.activityId,
      )?.name;
      toast.success(
        `Stopped timer for "${activityName}". Logged ${endTimerLog.duration}s.`,
      );
      return endTimerLog;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMsg = error.response?.data?.error || error.message;
        if (error.response?.status === 400 || error.response?.status === 409) {
          toast.error(serverMsg);
        } else {
          toast.error(`Failed: ${serverMsg}`);
        }
      } else {
        toast.error(`Failed to create activity: ${error}`);
      }
      console.log("Error creating activity:", error);
      return null;
    }
  };

  const pauseTimer = async (activityLogId: string) => {
    try {
      const updatedLog = await activityLogService.pauseTimer(activityLogId);
      setActivityLogs((prev) =>
        prev.map((log) => (log._id === activityLogId ? updatedLog : log)),
      );
      const activityName = activities.find(
        (a) => a._id === updatedLog.activityId,
      )?.name;
      toast.success(`Paused timer for "${activityName}"`);
      return updatedLog;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMsg = error.response?.data?.error || error.message;
        if (error.response?.status === 400 || error.response?.status === 409) {
          toast.error(serverMsg);
        } else {
          toast.error(`Failed: ${serverMsg}`);
        }
      } else {
        toast.error(`Failed to create activity: ${error}`);
      }
      console.log("Error creating activity:", error);
      return null;
    }
  };

  const resumeTimer = async (activityLogId: string) => {
    try {
      const updatedLog = await activityLogService.resumeTimer(activityLogId);
      setActivityLogs((prev) =>
        prev.map((log) => (log._id === activityLogId ? updatedLog : log)),
      );
      const activityName = activities.find(
        (a) => a._id === updatedLog.activityId,
      )?.name;
      toast.success(`Resumed timer for "${activityName}"`);
      return updatedLog;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMsg = error.response?.data?.error || error.message;
        if (error.response?.status === 400 || error.response?.status === 409) {
          toast.error(serverMsg);
        } else {
          toast.error(`Failed: ${serverMsg}`);
        }
      } else {
        toast.error(`Failed to create activity: ${error}`);
      }
      console.log("Error creating activity:", error);
      return null;
    }
  };

  const sendHeartbeat = async (activityLogId: string) => {
    try {
      const updatedLog = await activityLogService.sendHeartbeat(activityLogId);
      setActivityLogs((prev) =>
        prev.map((log) => (log._id === activityLogId ? updatedLog : log)),
      );
      return updatedLog;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMsg = error.response?.data?.error || error.message;
        if (error.response?.status === 400 || error.response?.status === 409) {
          console.error(serverMsg);
        } else {
          console.error(`Failed: ${serverMsg}`);
        }
      } else {
        console.error(`Failed to create activity: ${error}`);
      }
      console.log("Error creating activity:", error);
      return null;
    }
  };

  const resetTimer = async (activityLogId: string) => {
    try {
      const logToDelete = activityLogs.find((log) => log._id === activityLogId);
      const activityName = activities.find(
        (a) => a._id === logToDelete?.activityId,
      )?.name;
      await activityLogService.resetTimer(activityLogId);
      setActivityLogs((prev) =>
        prev.filter((log) => log._id !== activityLogId),
      );
      toast.success(`Discarded timer for "${activityName}"`);
      return logToDelete;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMsg = error.response?.data?.error || error.message;
        if (error.response?.status === 400 || error.response?.status === 409) {
          toast.error(serverMsg);
        } else {
          toast.error(`Failed: ${serverMsg}`);
        }
      } else {
        toast.error(`Failed to create activity: ${error}`);
      }
      console.log("Error creating activity:", error);
      return null;
    }
  };

  const resumeCrashedTimer = async (activityLogId: string) => {
    try {
      const fixedLog =
        await activityLogService.resumeCrashedTimer(activityLogId);

      setActivityLogs((prev) =>
        prev.map((log) => (log._id === activityLogId ? fixedLog : log)),
      );

      return fixedLog;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMsg = error.response?.data?.error || error.message;
        if (error.response?.status === 400 || error.response?.status === 409) {
          toast.error(serverMsg);
        } else {
          toast.error(`Failed: ${serverMsg}`);
        }
      } else {
        toast.error(`Failed to resume crashed timer: ${error}`);
      }
      console.error("Error resuming crashed timer:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  useEffect(() => {
    const activeLog = activityLogs.find((log) => log.status === "active");
    if (!activeLog) return;

    const intervalId = setInterval(() => {
      sendHeartbeat(activeLog._id);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [activityLogs]);

  return {
    activityLogs,
    loading,
    refetch: fetchActivityLogs,
    createManualLogEntry,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    resumeCrashedTimer,
  };
};
