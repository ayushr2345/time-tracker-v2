import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { useActivities } from "../data/useActivities";
import { useConfirm } from "../ui/useConfirmToast";
import { useActivityLog } from "../data/useActivityLog";
import type { ActivityLogEntry } from "../../types/activityLog";
import { APP_CONFIG } from "../../constants";

/**
 * Formats seconds into HH:MM:SS time format.
 * @param seconds           - Total seconds to format
 * @returns string          - Formatted duration string in HH:MM:SS format
 */
const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

/**
 * Custom hook for managing timer mode logic and state.
 * @remarks
 * Handles timer start/stop/pause/resume operations and crash recovery.
 * Manages UI state and interval updates for real-time timer display.
 * @returns Object containing timer state and handlers
 * @returns activities                       - Array of all activities
 * @returns loading                          - Loading state
 * @returns selectedActivityId               - Selected activity ID
 * @returns handleChangeActivity             - Handler for activity selection
 * @returns isRunning                        - Whether timer is currently running
 * @returns elapsed                          - Elapsed time in seconds
 * @returns isPaused                         - Whether timer is paused
 * @returns intervalRef                      - Reference to the timer interval
 * @returns isStartStopButtonDisabled        - Start/stop button disabled state
 * @returns isPauseResumeButtonDisabled      - Pause/resume button disabled state
 * @returns isResetButtonDisabled            - Reset button disabled state
 * @returns handleStart                      - Function to start the timer
 * @returns handleStop                       - Function to stop the timer
 * @returns handlePauseResume                - Function to pause/resume the timer
 * @returns handleResetTimer                 - Function to reset the timer
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

  const [isStartStopButtonDisabled, setIsStartStopButtonDisabled] =
    useState(false);
  const [isPauseResumeButtonDisabled, setIsPauseResumeButtonDisabled] =
    useState(false);
  const [isResetButtonDisabled, setIsResetButtonDisabled] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const crashCheckRef = useRef<string | null>(null);

  /**
   * Handles activity selection change event.
   * @param e                      - The select element change event
   */
  const handleChangeActivity = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedActivityId(e.target.value);
  };

  /**
   * Sets up or resumes the UI tick interval for timer display updates.
   * @remarks Updates elapsed time every 100ms for smooth UI display
   */
  const resumeUITick = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      const now = Date.now();
      if (startRef.current) {
        setElapsed(Math.floor((now - startRef.current) / 1000));
      }
    }, 1000);
  };

  /**
   * Starts a new timer for the selected activity.
   * @remarks Initializes UI state and begins tracking elapsed time
   */
  const handleStart = async () => {
    if (!selectedActivityId) {
      toast.error("Please select an activity to start the timer");
      return;
    }
    if (isRunning) return;

    const newLog = await startTimer(selectedActivityId);
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
    }
  };

  /**
   * Stops the running timer with confirmation dialog.
   * @remarks Calculates duration and prompts user to confirm logging the time
   */
  const handleStop = () => {
    if (!isRunning) return;
    const now = Date.now();
    const startedAt = startRef.current ?? now;
    const duration = Math.round((now - startedAt) / 1000);
    if (duration < APP_CONFIG.MIN_ACTIVITY_DURATION_MINS * 60) {
      toast.error(
        `Duration too short to log (minimum ${APP_CONFIG.MIN_ACTIVITY_DURATION_MINS} minutes)`,
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

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsPaused(true);
    setIsResetButtonDisabled(true);
    setIsPauseResumeButtonDisabled(true);
    setIsStartStopButtonDisabled(true);

    const activityName =
      activities.find((a) => a._id === selectedActivityId)?.name || "Activity";
    const formattedTime = formatDuration(duration);
    confirm({
      title: `Log ${formattedTime} duration to ${activityName}`,
      message: `Log ${formattedTime} duration to ${activityName}`,
      type: "INFO",
      confirmText: "Yes, Add Entry",
      onConfirm: async () => {
        const success = await stopTimer(activeLog._id);
        if (success) {
          setSelectedActivityId("");
          setIsRunning(false);
          setElapsed(0);
          setIsPaused(false);
          setIsResetButtonDisabled(false);
          setIsPauseResumeButtonDisabled(false);
          setIsStartStopButtonDisabled(false);
        } else {
          resumeUITick();
          setIsPaused(false);
          setIsResetButtonDisabled(false);
          setIsPauseResumeButtonDisabled(false);
          setIsStartStopButtonDisabled(false);
        }
      },
      onCancel: () => {
        resumeUITick();
        setIsPaused(false);
        setIsResetButtonDisabled(false);
        setIsPauseResumeButtonDisabled(false);
        setIsStartStopButtonDisabled(false);
        setIsRunning(true);
      },
    });
  };

  /**
   * Toggles between paused and running states for the active timer.
   * @remarks Handles both pausing and resuming with appropriate state updates
   */
  const handlePauseResume = async () => {
    if (!isRunning) return;

    if (!isPaused) {
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
      const pausedLog = activityLogs.find((log) => log.status === "paused");
      if (!pausedLog) return;
      const success = await resumeTimer(pausedLog._id);
      if (success) {
        startRef.current = Date.now() - elapsed * 1000;

        setIsPaused(false);
        resumeUITick();
      }
    }
  };

  /**
   * Resets/discards the current timer with confirmation dialog.
   * @remarks Requires user confirmation due to data loss
   */
  const handleResetTimer = () => {
    const activeLog = activityLogs.find(
      (log) => log.status === "active" || log.status === "paused",
    );
    if (!activeLog) return;

    // Pause UI visually
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsPaused(true);
    setIsResetButtonDisabled(true);
    setIsPauseResumeButtonDisabled(true);
    setIsStartStopButtonDisabled(true);
    const activityName =
      activities.find((a) => a._id === selectedActivityId)?.name || "Activity";
    const durationStr = formatDuration(elapsed);
    confirm({
      title: `Reset ${durationStr} duration for ${activityName}`,
      message: `Reset ${durationStr} duration for ${activityName}, this action is irreversible and will lose ${durationStr} duration for activity "${activityName}"`,
      type: "DANGER",
      confirmText: "Yes, Reset Timer",
      onConfirm: async () => {
        const success = await resetTimer(activeLog._id);
        if (success) {
          setSelectedActivityId("");
          setIsRunning(false);
          setElapsed(0);
          setIsPaused(false);
          setIsResetButtonDisabled(false);
          setIsPauseResumeButtonDisabled(false);
          setIsStartStopButtonDisabled(false);
          setIsRunning(false);
          startRef.current = null;
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        } else {
          resumeUITick();
        }
      },
      onCancel: () => {
        setIsPaused(false);
        setIsResetButtonDisabled(false);
        setIsPauseResumeButtonDisabled(false);
        setIsStartStopButtonDisabled(false);
        resumeUITick();
        setIsRunning(true);
      },
    });
  };

  // =========================================================
  // 6. RESTORE STATE ON REFRESH (Rehydration)
  // =========================================================
  useEffect(() => {
    // 1. Initial Checks
    if (loading || activityLogs.length === 0) return;

    const activeLog = activityLogs.find(
      (log) => log.status === "active" || log.status === "paused",
    );

    // If no active log, ensure UI is reset and exit
    if (!activeLog) {
      setIsRunning(false);
      setIsPaused(false);
      setElapsed(0);
      setSelectedActivityId("");
      startRef.current = null;
      crashCheckRef.current = null;
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    // -------------------------------------------------------
    // HELPER: Restore UI from a Valid Log
    // -------------------------------------------------------
    const restoreStateFromLog = (log: ActivityLogEntry) => {
      // Logic for "Active" and "Paused" states
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

      if (log.status === "active") {
        setIsPaused(false);
        startRef.current = effectiveStart;
        setElapsed(Math.floor((Date.now() - effectiveStart) / 1000));
        resumeUITick();
      } else if (log.status === "paused") {
        setIsPaused(true);
        if (log.pauseHistory && log.pauseHistory.length > 0) {
          const lastPause = log.pauseHistory[log.pauseHistory.length - 1];
          if (lastPause?.pauseTime) {
            const pauseStart = new Date(lastPause.pauseTime).getTime();
            const frozenElapsed = Math.floor(
              (pauseStart - effectiveStart) / 1000,
            );
            setElapsed(frozenElapsed);
          }
        }
        if (intervalRef.current) clearInterval(intervalRef.current);
      }

      // Enable buttons
      setIsStartStopButtonDisabled(false);
      setIsPauseResumeButtonDisabled(false);
      setIsResetButtonDisabled(false);
    };

    if (crashCheckRef.current === activeLog._id) {
      restoreStateFromLog(activeLog);
      return;
    }

    // -------------------------------------------------------
    // CALCULATE GAP
    // -------------------------------------------------------
    const now = new Date();
    const lastHeartbeat = new Date(activeLog.lastHeartbeat);
    const gapDuration = now.getTime() - lastHeartbeat.getTime();

    const activityName =
      activities.find((a) => a._id === activeLog.activityId)?.name ||
      "Activity";
    // -------------------------------------------------------
    // SCENARIO 1: > 24 Hours (Auto-Stop)
    // -------------------------------------------------------
    if (
      activeLog.status === "active" &&
      gapDuration >= APP_CONFIG.NO_TIMER_RECOVERY_BEYOND_THIS_MS
    ) {
      (async () => {
        if (crashCheckRef.current === activeLog._id) return;
        crashCheckRef.current = activeLog._id;
        // Backend handles the "Stop at Last Heartbeat" logic
        const processedLog = await resumeCrashedTimer(activeLog._id);

        // If backend returns 'completed', notify user.
        // The UI will reset on the next render because 'activeLog' won't be found.
        if (processedLog?.status === "completed") {
          toast.info(
            `Session expired (>24h) for ${activityName} and was saved automatically.`,
          );
        } else if (processedLog?.status === "active") {
          await resetTimer(activeLog._id);
          crashCheckRef.current = null;
        }
      })();
      return; // Stop execution here
    }

    // -------------------------------------------------------
    // SCENARIO 2: > 5 Minutes (Ask User)
    // -------------------------------------------------------
    if (
      activeLog.status === "active" &&
      gapDuration > APP_CONFIG.MIN_GAP_DURATION_FOR_CONFIRMATION_MS
    ) {
      // Stop ticking visually while we ask
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (crashCheckRef.current === activeLog._id) return;

      crashCheckRef.current = activeLog._id;

      const minutesAway = Math.floor(gapDuration / (60 * 1000));

      confirm({
        title: "Timer Interrupted",
        message: `You were away for ${minutesAway} minutes. Do you want to continue (excluding the gap) or stop the timer for ${activityName}?`,
        confirmText: "Continue Session",
        // Check if your confirm hook supports cancelText, otherwise it shows default
        // cancelText: "Stop Timer",
        type: "WARNING",

        onConfirm: async () => {
          // "Heal" the timer (Inject Pause)
          // This updates 'activityLogs', causing this useEffect to run again.
          // On the next run, gapDuration will be 0, falling through to Scenario 3.
          const res = await resumeCrashedTimer(activeLog._id);
          if (res) {
            restoreStateFromLog(activeLog);
          } else {
            toast.error("Error resuming the log");
          }
        },

        onCancel: async () => {
          // Stop the timer immediately
          // This updates 'activityLogs' to completed, resetting the UI on next render.
          await stopTimer(activeLog._id);
          crashCheckRef.current = null;
        },
      });
      return; // Stop execution, wait for user input
    }

    // -------------------------------------------------------
    // SCENARIO 3: < 5 Minutes (Resume Immediately)
    // -------------------------------------------------------
    crashCheckRef.current = null;
    restoreStateFromLog(activeLog);
  }, [activityLogs, loading]);

  return {
    activities,
    loading,
    selectedActivityId,
    handleChangeActivity,
    isRunning,
    elapsed,
    isPaused,
    intervalRef,
    isStartStopButtonDisabled,
    isPauseResumeButtonDisabled,
    isResetButtonDisabled,
    handleStart,
    handleStop,
    handlePauseResume,
    handleResetTimer,
  };
};
