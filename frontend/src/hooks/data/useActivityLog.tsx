import { useState, useEffect, useCallback } from "react";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import type {
  ActivityLogEntry,
  ActivityLogsWithDetails,
  CreateManualActivityLogPayload,
  CreateTimerActivityLogPayload,
  StopTimerActivityLogPayload,
} from "@time-tracker/shared";
import { useActivities } from "./useActivities";
import { activityLogService } from "../../services";
import { APP_LIMITS, HTTP_STATUS } from "@time-tracker/shared";

/**
 * Custom hook for managing activity logs and timer operations.
 * @remarks
 * Handles creating manual entries, starting/stopping timers, pausing/resuming, and crash recovery.
 * Provides comprehensive timer management functionality with error handling.
 *
 * @returns An object containing:
 * - `activityLogs`: Array of all activity logs.
 * - `loading`: Boolean indicating if data is being fetched.
 * - `refetch`: Function to refetch activity logs.
 * - `createManualLogEntry`: Function to create a manual log entry.
 * - `startTimer`: Function to start a new timer.
 * - `stopTimer`: Function to stop a running timer.
 * - `pauseTimer`: Function to pause a timer.
 * - `resumeTimer`: Function to resume a paused timer.
 * - `resetTimer`: Function to reset/discard a timer.
 * - `resumeCrashedTimer`: Function to recover a crashed timer.
 * - `deleteLogEntry`: Function to delete a specific log entry.
 */
export const useActivityLog = () => {
  const { activities } = useActivities();
  const [activityLogs, setActivityLogs] = useState<ActivityLogsWithDetails[]>(
    [],
  );
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Helper to merge activity details (name & color) into a log entry.
   * @param activityId - The ID of the activity.
   * @param updatedActivityLog - The log entry from the backend.
   * @returns The log entry enhanced with activity name and color.
   */
  const saveActivityLogEntryWithDetails = (
    activityId: string,
    updatedActivityLog: ActivityLogEntry,
  ) => {
    const activity = activities.find((a) => a._id === activityId);
    const activityName = activity?.name;
    const activityColor = activity?.color;

    const updatedActivityLogWithDetails: ActivityLogsWithDetails = {
      ...updatedActivityLog,
      activityName: activityName || "Activity-Undefined",
      activityColor: activityColor || APP_LIMITS.DEFAULT_ACTIVITY_COLOR,
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
      toast.error("Failed to fetch activity logs");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Creates a manual activity log entry with validation and error handling.
   * @param activityId - The ID of the activity to log.
   * @param startTime - When the activity started.
   * @param endTime - When the activity ended.
   * @returns The created activity log entry or null if failed.
   */
  const createManualLogEntry = async (data: CreateManualActivityLogPayload) => {
    try {
      const savedActivityLog =
        await activityLogService.createManualLogEntry(data);
      const updatedActivityLogWithDetails = saveActivityLogEntryWithDetails(
        data.activityId,
        savedActivityLog,
      );
      setActivityLogs((prev) => [updatedActivityLogWithDetails, ...prev]);

      toast.success(
        `Activity Log entry for "${updatedActivityLogWithDetails.activityName}" and duration ${savedActivityLog.duration} created!`,
      );
      return savedActivityLog;
    } catch (error) {
      handleError(error, "create activity log");
      return null;
    }
  };

  /**
   * Starts a new timer for the specified activity.
   * @param activityId - The ID of the activity to start timer for.
   * @param startTime - (Optional) Start time of a log (used for split timer).
   * @returns The started activity log entry or null if failed.
   */
  const startTimer = async (data: CreateTimerActivityLogPayload) => {
    try {
      const startTimerLog = await activityLogService.startTimer(data);
      const startTimerActivityLogWithDetails = saveActivityLogEntryWithDetails(
        data.activityId,
        startTimerLog,
      );
      setActivityLogs((prev) => [startTimerActivityLogWithDetails, ...prev]);
      toast.success(
        `Started timer for "${startTimerActivityLogWithDetails.activityName}"!`,
      );
      return startTimerLog;
    } catch (error) {
      handleError(error, "start timer");
      return null;
    }
  };

  /**
   * Stops a running timer and logs the activity.
   * @param activityLogId - The ID of the timer to stop.
   * @param endTime - (Optional) End time of a log (used for split timer).
   * @returns The stopped activity log entry or null if failed.
   */
  const stopTimer = async (data: StopTimerActivityLogPayload) => {
    try {
      const endTimerLog = await activityLogService.stopTimer(data);
      const endTimerActivityLogWithDetails = saveActivityLogEntryWithDetails(
        endTimerLog.activityId,
        endTimerLog,
      );
      setActivityLogs((prev) =>
        prev.map((log) =>
          log._id === data._id ? endTimerActivityLogWithDetails : log,
        ),
      );

      toast.success(
        `Stopped timer for "${endTimerActivityLogWithDetails.activityName}". Logged ${endTimerLog.duration}s.`,
      );
      return endTimerLog;
    } catch (error) {
      handleError(error, "stop timer");
      return null;
    }
  };

  /**
   * Pauses a running timer.
   * @param activityLogId - The ID of the timer to pause.
   * @returns The paused activity log entry or null if failed.
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
      handleError(error, "pause timer");
      return null;
    }
  };

  /**
   * Resumes a paused timer.
   * @param activityLogId - The ID of the timer to resume.
   * @returns The resumed activity log entry or null if failed.
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
      handleError(error, "resume timer");
      return null;
    }
  };

  /**
   * Sends a heartbeat for an active timer to detect disconnections.
   * @param activityLogId - The ID of the timer to send heartbeat for.
   * @returns The updated activity log entry or null if failed.
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
      // Quietly log heartbeat errors to console instead of toasting
      console.error("Heartbeat failed:", error);
      return null;
    }
  };

  /**
   * Resets/discards a timer without logging time.
   * @param activityLogId - The ID of the timer to reset.
   * @returns The deleted activity log entry or null if failed.
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
      handleError(error, "reset timer");
      return null;
    }
  };

  /**
   * Attempts to recover a timer that may have crashed or lost connection.
   * @param activityLogId - The ID of the timer to recover.
   * @returns The recovered activity log entry or null if failed.
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
      handleError(error, "resume crashed timer");
      return null;
    }
  };

  /**
   * Deletes an activity log entry.
   * @param activityLogId - The ID of the activity log to be deleted.
   * @returns The deleted activity log entry or null if failed.
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
      handleError(error, "delete log entry");
      return null;
    }
  };

  // Helper for consistent error handling
  const handleError = (error: unknown, action: string) => {
    if (error instanceof AxiosError) {
      const serverMsg = error.response?.data?.error || error.message;
      if (
        error.response?.status === HTTP_STATUS.BAD_REQUEST ||
        error.response?.status === HTTP_STATUS.CONFLICT
      ) {
        toast.error(serverMsg);
      } else {
        toast.error(`Failed to ${action}: ${serverMsg}`);
      }
    } else {
      toast.error(`Failed to ${action}: ${error}`);
    }
    console.error(`Error during ${action}:`, error);
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
