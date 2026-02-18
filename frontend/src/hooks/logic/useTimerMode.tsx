import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useActivities } from "../data/useActivities";
import { useActivityLog } from "../data/useActivityLog";
import type { ActivityLogEntry } from "@time-tracker/shared";
import { useConfirm } from "../ui/useConfirmToast";
import { APP_LIMITS } from "@time-tracker/shared";
import { formatDuration } from "../../utils";
import type {
  CreateTimerActivityLogPayload,
  StopTimerActivityLogPayload,
} from "@time-tracker/shared";

/**
 * Custom hook for managing timer mode logic and state.
 * @remarks
 * Handles timer start/stop/pause/resume operations, crash recovery, and midnight splitting.
 * Manages UI state and interval updates for real-time timer display.
 *
 * @returns An object containing:
 * - `activities`: Array of all available activities.
 * - `loading`: Loading state from data source.
 * - `selectedActivityId`: ID of the currently selected activity.
 * - `handleChangeActivity`: Handler for activity selection dropdown.
 * - `isRunning`: Boolean indicating if a timer session is active (running or paused).
 * - `elapsed`: Total elapsed seconds for the current session.
 * - `isPaused`: Boolean indicating if the timer is currently paused.
 * - `handleStart`: Function to start a new timer.
 * - `handleStop`: Function to stop and save the current timer.
 * - `handlePauseResume`: Function to toggle pause state.
 * - `handleResetTimer`: Function to discard the current timer.
 * - `isStartStopButtonDisabled`: Disabled state for the main action button.
 * - `isPauseResumeButtonDisabled`: Disabled state for the pause button.
 * - `isResetButtonDisabled`: Disabled state for the reset button.
 */
export const useTimerMode = () => {
  const { activities, loading } = useActivities();
  const {
    activityLogs,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    resumeCrashedTimer,
  } = useActivityLog();
  const { confirm } = useConfirm();

  const [selectedActivityId, setSelectedActivityId] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(true);

  // Button States
  const [isStartStopButtonDisabled, setIsStartStopButtonDisabled] =
    useState(false);
  const [isPauseResumeButtonDisabled, setIsPauseResumeButtonDisabled] =
    useState(false);
  const [isResetButtonDisabled, setIsResetButtonDisabled] = useState(false);

  // Refs for timer logic
  const intervalRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const crashCheckRef = useRef<string | null>(null);
  const lastSplitDateRef = useRef<string | null>(null);

  /**
   * Handles activity selection change event.
   * @param e - The select element change event.
   */
  const handleChangeActivity = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedActivityId(e.target.value);
  };

  /**
   * Sets up the UI tick interval.
   * Updates `elapsed` state every second based on `startRef`.
   */
  const resumeUITick = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      const now = Date.now();
      if (startRef.current) {
        setElapsed(Math.floor((now - startRef.current) / 1000));
      }
    }, 1000);
  }, []);

  /**
   * Starts a new timer for the selected activity.
   */
  const handleStart = async () => {
    if (!selectedActivityId) {
      toast.error("Please select an activity to start the timer");
      return;
    }
    if (isRunning) return;

    setIsStartStopButtonDisabled(true); // Prevent double-click
    const timerEntryPayload: CreateTimerActivityLogPayload = {
      activityId: selectedActivityId,
    };
    const newLog = await startTimer(timerEntryPayload);

    if (newLog) {
      const serverStartTime = new Date(newLog.startTime).getTime();
      startRef.current = serverStartTime;
      setIsRunning(true);
      setIsPaused(false);
      setElapsed(0);
      setIsStartStopButtonDisabled(false);
      setIsPauseResumeButtonDisabled(false);
      setIsResetButtonDisabled(false);
      resumeUITick();
    } else {
      setIsStartStopButtonDisabled(false);
    }
  };

  /**
   * Stops the running timer with a confirmation dialog.
   * If confirmed, saves the log entry.
   */
  const handleStop = () => {
    if (!isRunning) return;

    // 1. Calculate duration locally for validation
    const now = Date.now();
    const startedAt = startRef.current ?? now;
    const duration = Math.round((now - startedAt) / 1000);

    if (duration < APP_LIMITS.MIN_ACTIVITY_DURATION_MINS * 60) {
      toast.error(
        `Duration too short to log (minimum ${APP_LIMITS.MIN_ACTIVITY_DURATION_MINS} minutes)`,
      );
      return;
    }

    const activeLog = activityLogs.find(
      (log) => log.status === "active" || log.status === "paused",
    );
    if (!activeLog) {
      toast.error("No active timer to stop!");
      return;
    }

    // 2. Pause UI
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPaused(true);
    disableAllButtons(true);

    const activityName =
      activities.find((a) => a._id === selectedActivityId)?.name || "Activity";
    const formattedTime = formatDuration(duration);

    const stopTimerEntryPayload: StopTimerActivityLogPayload = {
      _id: activeLog._id,
    };

    confirm({
      title: `Log ${formattedTime} for ${activityName}?`,
      message: `Are you sure you want to stop and save this session?`,
      type: "INFO",
      confirmText: "Yes, Save Entry",
      onConfirm: async () => {
        const success = await stopTimer(stopTimerEntryPayload);
        if (success) {
          resetLocalState();
        } else {
          // If server failed, resume UI so user doesn't lose data
          resumeUITick();
          setIsPaused(false);
          disableAllButtons(false);
        }
      },
      onCancel: () => {
        resumeUITick();
        setIsPaused(false);
        disableAllButtons(false);
      },
    });
  };

  /**
   * Toggles between paused and running states.
   */
  const handlePauseResume = async () => {
    if (!isRunning) return;

    if (!isPaused) {
      // PAUSE ACTION
      const activeLog = activityLogs.find((log) => log.status === "active");
      if (!activeLog) return;

      const success = await pauseTimer(activeLog._id);
      if (success) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsPaused(true);
      }
    } else {
      // RESUME ACTION
      const pausedLog = activityLogs.find((log) => log.status === "paused");
      if (!pausedLog) return;

      const success = await resumeTimer(pausedLog._id);
      if (success) {
        // Recalculate startRef based on current elapsed time to keep UI consistent
        startRef.current = Date.now() - elapsed * 1000;
        setIsPaused(false);
        resumeUITick();
      }
    }
  };

  /**
   * Resets/discards the current timer with a destructive confirmation.
   */
  const handleResetTimer = () => {
    const activeLog = activityLogs.find(
      (log) => log.status === "active" || log.status === "paused",
    );
    if (!activeLog) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPaused(true);
    disableAllButtons(true);

    const activityName =
      activities.find((a) => a._id === selectedActivityId)?.name || "Activity";
    const durationStr = formatDuration(elapsed);

    confirm({
      title: `Discard Timer?`,
      message: `You are about to discard ${durationStr} of "${activityName}". This cannot be undone.`,
      type: "DANGER",
      confirmText: "Yes, Discard",
      onConfirm: async () => {
        const success = await resetTimer(activeLog._id);
        if (success) {
          resetLocalState();
        } else {
          resumeUITick();
          setIsPaused(true);
          disableAllButtons(false);
        }
      },
      onCancel: () => {
        disableAllButtons(false);
      },
    });
  };

  // --- Helper Functions ---

  const disableAllButtons = (disabled: boolean) => {
    setIsStartStopButtonDisabled(disabled);
    setIsPauseResumeButtonDisabled(disabled);
    setIsResetButtonDisabled(disabled);
  };

  const resetLocalState = () => {
    setSelectedActivityId("");
    setIsRunning(false);
    setElapsed(0);
    setIsPaused(false);
    startRef.current = null;
    crashCheckRef.current = null;
    disableAllButtons(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  /**
   * Restores UI state from an existing log entry (e.g. on page refresh).
   */
  const restoreStateFromLog = useCallback(
    (log: ActivityLogEntry) => {
      // Calculate effective start time: Original Start + Total Paused Duration
      const startTime = new Date(log.startTime).getTime();
      const totalPausedMs = (log.pauseHistory || []).reduce((acc, slot) => {
        if (slot.resumeTime && slot.pauseTime) {
          return (
            acc +
            (new Date(slot.resumeTime).getTime() -
              new Date(slot.pauseTime).getTime())
          );
        }
        return acc;
      }, 0);

      const effectiveStart = startTime + totalPausedMs;

      setSelectedActivityId(log.activityId);
      setIsRunning(true);
      disableAllButtons(false);

      if (log.status === "active") {
        setIsPaused(false);
        startRef.current = effectiveStart;
        setElapsed(Math.floor((Date.now() - effectiveStart) / 1000));
        resumeUITick();
      } else if (log.status === "paused") {
        setIsPaused(true);
        if (intervalRef.current) clearInterval(intervalRef.current);

        // Calculate frozen duration
        if (log.pauseHistory && log.pauseHistory.length > 0) {
          const lastPause = log.pauseHistory[log.pauseHistory.length - 1];
          if (lastPause?.pauseTime) {
            const pauseStart = new Date(lastPause.pauseTime).getTime();
            setElapsed(Math.floor((pauseStart - effectiveStart) / 1000));
          }
        }
      }
    },
    [resumeUITick],
  );

  // --- Effects ---

  /**
   * Effect: Crash Recovery & State Restoration
   * Runs whenever activityLogs change (e.g., on initial load).
   */
  useEffect(() => {
    if (loading) return;

    const activeLog = activityLogs.find(
      (log) => log.status === "active" || log.status === "paused",
    );

    // If no active log, ensure UI is clean
    if (!activeLog) {
      resetLocalState();
      return;
    }

    // SCENARIO 0: "Lazy Split" (Fix missed midnight split)
    const logStartDate = new Date(activeLog.startTime);
    const today = new Date();
    const isDifferentDay =
      logStartDate.getDate() !== today.getDate() ||
      logStartDate.getMonth() !== today.getMonth() ||
      logStartDate.getFullYear() !== today.getFullYear();

    if (activeLog.status === "active" && isDifferentDay) {
      // Avoid infinite loop if we are already processing this log
      if (crashCheckRef.current === activeLog._id) return;
      crashCheckRef.current = activeLog._id;

      (async () => {
        const endOfLogDate = new Date(logStartDate);
        endOfLogDate.setHours(23, 59, 59, 999);

        const startOfNextDay = new Date(endOfLogDate);
        startOfNextDay.setTime(startOfNextDay.getTime() + 1); // 00:00:00.000

        try {
          const timerEntryPayload: CreateTimerActivityLogPayload = {
            activityId: activeLog.activityId,
            startTime: startOfNextDay,
          };
          const stopTimerEntryPayload: StopTimerActivityLogPayload = {
            _id: activeLog.activityId,
            endTime: endOfLogDate,
          };
          await stopTimer(stopTimerEntryPayload);
          await startTimer(timerEntryPayload);
          toast.success("Recovered missed split from previous day.");
        } catch (err) {
          console.error("Recovery split failed", err);
        } finally {
          crashCheckRef.current = null;
        }
      })();
      return; // Stop here, don't restore UI for the old log
    }

    // SCENARIO 1 & 2: Crash Detection
    if (crashCheckRef.current === activeLog._id) return;

    const now = new Date();
    const lastHeartbeat = new Date(activeLog.lastHeartbeat);
    const gapDuration = now.getTime() - lastHeartbeat.getTime();

    // > 24 Hours: Auto-Stop
    if (
      activeLog.status === "active" &&
      gapDuration >= APP_LIMITS.NO_TIMER_RECOVERY_BEYOND_THIS_MS
    ) {
      crashCheckRef.current = activeLog._id;
      (async () => {
        await resumeCrashedTimer(activeLog._id); // Backend will likely close it
        crashCheckRef.current = null;
      })();
      return;
    }

    // > 5 Minutes: User Confirmation
    if (
      activeLog.status === "active" &&
      gapDuration > APP_LIMITS.MIN_GAP_DURATION_FOR_CONFIRMATION_MS
    ) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      crashCheckRef.current = activeLog._id;

      const minutesAway = Math.floor(gapDuration / 60000);
      const activityName =
        activities.find((a) => a._id === activeLog.activityId)?.name ||
        "Activity";
      const stopTimerEntryPayload: StopTimerActivityLogPayload = {
        _id: activeLog._id,
        endTime: lastHeartbeat,
      };

      confirm({
        title: "Timer Interrupted",
        message: `You were away for ${minutesAway} minutes. Do you want to continue (excluding the gap) or stop the timer for "${activityName}"?`,
        confirmText: "Continue Session",
        type: "WARNING",
        onConfirm: async () => {
          await resumeCrashedTimer(activeLog._id);
          crashCheckRef.current = null;
        },
        onCancel: async () => {
          await stopTimer(stopTimerEntryPayload);
          crashCheckRef.current = null;
        },
      });
      return;
    }

    // SCENARIO 3: Normal Restore
    crashCheckRef.current = null;
    restoreStateFromLog(activeLog);
  }, [activityLogs, loading, restoreStateFromLog, activities]); // Added dependencies

  /**
   * Effect: Real-time Midnight Split Check
   * Only runs when timer is actively running.
   */
  useEffect(() => {
    if (!isRunning) return;

    const activeLog = activityLogs.find((log) => log.status === "active");
    if (!activeLog) return;

    const checkMidnight = setInterval(async () => {
      const now = new Date();
      const todayDateString = now.toDateString();

      // Check if it's 00:00:00 AND we haven't handled this day yet
      if (
        now.getHours() === 0 &&
        now.getMinutes() === 0 &&
        now.getSeconds() <= 2 &&
        lastSplitDateRef.current !== todayDateString
      ) {
        lastSplitDateRef.current = todayDateString;

        // Midnight Split Logic
        const yesterdayEnd = new Date(now);
        yesterdayEnd.setHours(23, 59, 59, 999);
        yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);

        try {
          const timerEntryPayload: CreateTimerActivityLogPayload = {
            activityId: activeLog.activityId,
            startTime: todayStart,
          };
          const stopTimerEntryPayload: StopTimerActivityLogPayload = {
            _id: activeLog._id,
            endTime: yesterdayEnd,
          };
          // Stop yesterday's log
          await stopTimer(stopTimerEntryPayload);
          // Start today's log
          await startTimer(timerEntryPayload);
          toast.info("New day! Timer split automatically.");
        } catch (err) {
          console.error("Split failed", err);
        }
      }
    }, 1000);

    return () => clearInterval(checkMidnight);
  }, [isRunning, activityLogs]);

  return {
    activities,
    loading,
    selectedActivityId,
    handleChangeActivity,
    isRunning,
    elapsed,
    isPaused,
    intervalRef, // Exposed if needed for debug, but generally internal
    isStartStopButtonDisabled,
    isPauseResumeButtonDisabled,
    isResetButtonDisabled,
    handleStart,
    handleStop,
    handlePauseResume,
    handleResetTimer,
  };
};
