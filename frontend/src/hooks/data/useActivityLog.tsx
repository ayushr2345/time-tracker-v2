import { useState, useEffect, useCallback } from "react";
import { activityLogService } from "../../services";
import type {
  ActivityLogEntry,
  ActivityLogsWithDetails,
} from "../../types/activityLog";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import "react-toastify/dist/ReactToastify.css";
import { useActivities } from "./useActivities";
import { APP_CONFIG, HTTP_STATUS } from "../../constants";

/**
 * Custom hook for managing activity logs and timer operations.
 * @remarks
 * Handles creating manual entries, starting/stopping timers, pausing/resuming, and crash recovery.
 * Provides comprehensive timer management functionality with error handling.
 * @returns Object containing activity logs state and management methods
 * @returns activityLogs           - Array of all activity logs
 * @returns loading                - Loading state
 * @returns fetchActivityLogs      - Function to refetch activity logs
 * @returns createManualLogEntry   - Function to create a manual log entry
 * @returns startTimer             - Function to start a new timer
 * @returns stopTimer              - Function to stop a running timer
 * @returns pauseTimer             - Function to pause a timer
 * @returns resumeTimer            - Function to resume a paused timer
 * @returns sendHeartbeat          - Function to send heartbeat for crash detection
 * @returns resetTimer             - Function to reset/discard a timer
 * @returns resumeCrashedTimer     - Function to recover a crashed timer
 */
export const useActivityLog = () => {
  const { activities } = useActivities();
  const [activityLogs, setActivityLogs] = useState<ActivityLogsWithDetails[]>(
    [],
  );
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Creates a Activity Log Entry with Details (activityName & activityColor)
   * @param activityId                    - The ID of the activity
   * @param updatedActivityLog            - The updated log from the backend
   * @returns ActivityLogEntryWithDetails - The created activity log entry with details
   */
  const saveActivityLogEntryWithDetails = (
    activityId: string,
    updatedActivityLog: ActivityLogEntry,
  ) => {
    const activityName = activities.find((a) => a._id === activityId)?.name;
    const activityColor = activities.find((a) => a._id === activityId)?.color;

    const updatedActivityLogWithDetails: ActivityLogsWithDetails = {
      ...updatedActivityLog,
      activityName: activityName ? activityName : "Activity-Undefined",
      activityColor: activityColor
        ? activityColor
        : APP_CONFIG.DEFAULT_ACTIVITY_COLOR,
    };
    return updatedActivityLogWithDetails;
  };

  /**
   * Fetches all activity logs from the backend and updates state.
   */
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

  /**
   * Creates a manual activity log entry with validation and error handling.
   * @param activityId            - The ID of the activity to log
   * @param startTime             - When the activity started
   * @param endTime               - When the activity ended
   * @returns ActivityLogEntry    - The created activity log entry or null if failed
   */
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
      const updatedActivityLogWithDetails = saveActivityLogEntryWithDetails(
        activityId,
        savedActivityLog,
      );
      setActivityLogs((prev) => [updatedActivityLogWithDetails, ...prev]);

      toast.success(
        `Activity Log entry for "${updatedActivityLogWithDetails.activityName}" and duration ${savedActivityLog.duration} created!`,
      );
      return savedActivityLog;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMsg = error.response?.data?.error || error.message;
        if (
          error.response?.status === HTTP_STATUS.BAD_REQUEST ||
          error.response?.status === HTTP_STATUS.CONFLICT
        ) {
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

  /**
   * Starts a new timer for the specified activity with error handling.
   * @param activityId            - The ID of the activity to start timer for
   * @param startTime             - Optional: start time of a log (used in case of split timer)
   * @returns ActivityLogEntry    - The started activity log entry or null if failed
   */
  const startTimer = async (activityId: string, startTime?: Date) => {
    try {
      const startTimerLog = await activityLogService.startTimer(
        activityId,
        startTime,
      );
      const startTimerActivityLogWithDetails = saveActivityLogEntryWithDetails(
        activityId,
        startTimerLog,
      );
      setActivityLogs((prev) => [startTimerActivityLogWithDetails, ...prev]);
      toast.success(
        `Started timer for "${startTimerActivityLogWithDetails.activityName}"!`,
      );
      return startTimerLog;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMsg = error.response?.data?.error || error.message;
        if (
          error.response?.status === HTTP_STATUS.BAD_REQUEST ||
          error.response?.status === HTTP_STATUS.CONFLICT
        ) {
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

  /**
   * Stops a running timer and logs the activity with error handling.
   * @param activityLogId         - The ID of the timer to stop
   * @param endTime               - Optional: end time of a log (used in case of split timer)
   * @returns ActivityLogEntry    - The stopped activity log entry or null if failed
   */
  const stopTimer = async (activityLogId: string, endTime?: Date) => {
    try {
      const endTimerLog = await activityLogService.stopTimer(
        activityLogId,
        endTime,
      );
      const endTimerActivityLogWithDetails = saveActivityLogEntryWithDetails(
        endTimerLog.activityId,
        endTimerLog,
      );
      setActivityLogs((prev) =>
        prev.map((log) =>
          log._id === activityLogId ? endTimerActivityLogWithDetails : log,
        ),
      );

      toast.success(
        `Stopped timer for "${endTimerActivityLogWithDetails.activityName}". Logged ${endTimerLog.duration}s.`,
      );
      return endTimerLog;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMsg = error.response?.data?.error || error.message;
        if (
          error.response?.status === HTTP_STATUS.BAD_REQUEST ||
          error.response?.status === HTTP_STATUS.CONFLICT
        ) {
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

  /**
   * Pauses a running timer with error handling.
   * @param activityLogId         - The ID of the timer to pause
   * @returns ActivityLogEntry    - The paused activity log entry or null if failed
   */
  const pauseTimer = async (activityLogId: string) => {
    try {
      const updatedLog = await activityLogService.pauseTimer(activityLogId);
      const updateActivityLogWithDetails = saveActivityLogEntryWithDetails(
        updatedLog.activityId,
        updatedLog,
      );
      setActivityLogs((prev) =>
        prev.map((log) =>
          log._id === activityLogId ? updateActivityLogWithDetails : log,
        ),
      );
      toast.success(
        `Paused timer for "${updateActivityLogWithDetails.activityName}"`,
      );
      return updatedLog;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMsg = error.response?.data?.error || error.message;
        if (
          error.response?.status === HTTP_STATUS.BAD_REQUEST ||
          error.response?.status === HTTP_STATUS.CONFLICT
        ) {
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

  /**
   * Resumes a paused timer with error handling.
   * @param activityLogId         - The ID of the timer to resume
   * @returns ActivityLogEntry    - The resumed activity log entry or null if failed
   */
  const resumeTimer = async (activityLogId: string) => {
    try {
      const updatedLog = await activityLogService.resumeTimer(activityLogId);
      const updateActivityLogWithDetails = saveActivityLogEntryWithDetails(
        updatedLog.activityId,
        updatedLog,
      );
      setActivityLogs((prev) =>
        prev.map((log) =>
          log._id === activityLogId ? updateActivityLogWithDetails : log,
        ),
      );
      toast.success(
        `Resumed timer for "${updateActivityLogWithDetails.activityName}"`,
      );
      return updatedLog;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMsg = error.response?.data?.error || error.message;
        if (
          error.response?.status === HTTP_STATUS.BAD_REQUEST ||
          error.response?.status === HTTP_STATUS.CONFLICT
        ) {
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

  /**
   * Sends a heartbeat for an active timer to detect disconnections.
   * @param activityLogId         - The ID of the timer to send heartbeat for
   * @returns ActivityLogEntry    - The updated activity log entry or null if failed
   */
  const sendHeartbeat = async (activityLogId: string) => {
    try {
      const updatedLog = await activityLogService.sendHeartbeat(activityLogId);
      const updateActivityLogWithDetails = saveActivityLogEntryWithDetails(
        updatedLog.activityId,
        updatedLog,
      );
      setActivityLogs((prev) =>
        prev.map((log) =>
          log._id === activityLogId ? updateActivityLogWithDetails : log,
        ),
      );
      return updatedLog;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMsg = error.response?.data?.error || error.message;
        if (
          error.response?.status === HTTP_STATUS.BAD_REQUEST ||
          error.response?.status === HTTP_STATUS.CONFLICT
        ) {
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

  /**
   * Resets/discards a timer without logging time with error handling.
   * @param activityLogId         - The ID of the timer to reset
   * @returns ActivityLogEntry    - The deleted activity log entry or null if failed
   */
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
        if (
          error.response?.status === HTTP_STATUS.BAD_REQUEST ||
          error.response?.status === HTTP_STATUS.CONFLICT
        ) {
          toast.error(serverMsg);
        } else {
          toast.error(`Failed: ${serverMsg}`);
        }
      } else {
        toast.error(`Failed to reset activity timer: ${error}`);
      }
      console.log("Error resetting activity timer:", error);
      return null;
    }
  };

  /**
   * Attempts to recover a timer that may have crashed or lost connection.
   * @param activityLogId         - The ID of the timer to recover
   * @returns ActivityLogEntry    - The recovered activity log entry or null if failed
   */
  const resumeCrashedTimer = async (activityLogId: string) => {
    try {
      const fixedLog =
        await activityLogService.resumeCrashedTimer(activityLogId);
      const updateActivityLogWithDetails = saveActivityLogEntryWithDetails(
        fixedLog.activityId,
        fixedLog,
      );
      setActivityLogs((prev) =>
        prev.map((log) =>
          log._id === activityLogId ? updateActivityLogWithDetails : log,
        ),
      );

      return fixedLog;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMsg = error.response?.data?.error || error.message;
        if (
          error.response?.status === HTTP_STATUS.BAD_REQUEST ||
          error.response?.status === HTTP_STATUS.CONFLICT
        ) {
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

  /**
   * Deleted an activity log entry
   * @param activityLogId         - The ID of the activity log to be deleted
   * @returns ActivityLogEntry    - The deleted activity log entry or null if failed
   */
  const deleteLogEntry = async (activityLogId: string) => {
    try {
      const logToDelete = activityLogs.find((log) => log._id === activityLogId);
      const activityName = activities.find(
        (a) => a._id === logToDelete?.activityId,
      )?.name;
      await activityLogService.deleteLogEntry(activityLogId);
      setActivityLogs((prev) =>
        prev.filter((log) => log._id !== activityLogId),
      );
      toast.success(`Deleted activity log entry for "${activityName}"`);
      return logToDelete;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMsg = error.response?.data?.error || error.message;
        if (
          error.response?.status === HTTP_STATUS.BAD_REQUEST ||
          error.response?.status === HTTP_STATUS.CONFLICT
        ) {
          toast.error(serverMsg);
        } else {
          toast.error(`Failed: ${serverMsg}`);
        }
      } else {
        toast.error(`Failed to delete activity log entry: ${error}`);
      }
      console.log("Error deleting activity log entry:", error);
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
    deleteLogEntry,
  };
};
