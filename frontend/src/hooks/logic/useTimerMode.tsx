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
  const lastSplitDateRef = useRef<string | null>(null);

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
      } else {
        toast.error("Cannot pause timer");
      }
    } else {
      const pausedLog = activityLogs.find((log) => log.status === "paused");
      if (!pausedLog) return;
      const success = await resumeTimer(pausedLog._id);
      if (success) {
        startRef.current = Date.now() - elapsed * 1000;

        setIsPaused(false);
        resumeUITick();
      } else {
        toast.error("Cannot resume timer");
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

  useEffect(() => {
    // 1. Initial Safety Checks
    if (loading) return;

    // Find the current active or paused session
    const activeLog = activityLogs.find(
      (log) => log.status === "active" || log.status === "paused",
    );

    // If no active log exists, strict reset of the UI
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
    // SCENARIO 0: "Lazy Split" (Fixing a missed midnight split)
    // -------------------------------------------------------
    // Check if the active log started on a DIFFERENT day than today.
    const logStartDate = new Date(activeLog.startTime);
    const today = new Date();

    const isDifferentDay =
      logStartDate.getDate() !== today.getDate() ||
      logStartDate.getMonth() !== today.getMonth() ||
      logStartDate.getFullYear() !== today.getFullYear();

    if (activeLog.status === "active" && isDifferentDay) {
      console.log(
        "🛠️ Found a log from yesterday. Triggering recovery split...",
      );

      // Lock to prevent loops
      if (crashCheckRef.current === activeLog._id) return;
      crashCheckRef.current = activeLog._id;

      (async () => {
        // 1. Calculate the end of THAT specific day
        const endOfLogDate = new Date(logStartDate);
        endOfLogDate.setHours(23, 59, 59, 999);

        // 2. Calculate the start of the NEXT day
        const startOfNextDay = new Date(endOfLogDate);
        startOfNextDay.setTime(startOfNextDay.getTime() + 1); // +1ms

        try {
          // 3. Stop the old one
          await stopTimer(activeLog._id, endOfLogDate);

          // 4. Start the new one
          // Note: This starts the new timer at 00:00:00 of the correct day
          await startTimer(activeLog.activityId, startOfNextDay);

          toast.success("Recovered missed split from previous day.");
        } catch (err) {
          console.error("Recovery split failed", err);
          // It will try again on next refresh
        } finally {
          crashCheckRef.current = null;
        }
      })();

      return; // Stop execution so we don't restore UI for the old log
    }

    // -------------------------------------------------------
    // HELPER: Restore UI from a Valid Log
    // -------------------------------------------------------
    const restoreStateFromLog = (log: ActivityLogEntry) => {
      // Calculate effective start time by subtracting total paused duration
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

      // Update UI State
      setSelectedActivityId(log.activityId);
      setIsRunning(true);

      if (log.status === "active") {
        setIsPaused(false);
        startRef.current = effectiveStart;

        // Update elapsed immediately to prevent "00:00:00" flash
        setElapsed(Math.floor((Date.now() - effectiveStart) / 1000));

        // Restart the UI tick
        resumeUITick();
      } else if (log.status === "paused") {
        setIsPaused(true);
        if (intervalRef.current) clearInterval(intervalRef.current);

        // Calculate frozen elapsed time based on last pause
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
      }

      // Enable control buttons
      setIsStartStopButtonDisabled(false);
      setIsPauseResumeButtonDisabled(false);
      setIsResetButtonDisabled(false);
    };

    // -------------------------------------------------------
    // CRASH DETECTION & RECOVERY
    // -------------------------------------------------------

    // If we are already handling a crash for this specific log,
    // don't run the check again (prevents loops).
    if (crashCheckRef.current === activeLog._id) {
      // Note: We do NOT call restoreStateFromLog here because
      // we are likely waiting for user input in the modal.
      return;
    }

    const now = new Date();
    const lastHeartbeat = new Date(activeLog.lastHeartbeat);
    const gapDuration = now.getTime() - lastHeartbeat.getTime();

    // SCENARIO 1: > 24 Hours (Auto-Stop silently)
    if (
      activeLog.status === "active" &&
      gapDuration >= APP_CONFIG.NO_TIMER_RECOVERY_BEYOND_THIS_MS
    ) {
      crashCheckRef.current = activeLog._id; // Lock it

      (async () => {
        // Backend handles "Stop at Last Heartbeat"
        const processedLog = await resumeCrashedTimer(activeLog._id);

        const activityName =
          activities.find((a) => a._id === activeLog.activityId)?.name ||
          "Activity";

        if (processedLog?.status === "completed") {
          toast.info(
            `Session expired (>24h) for ${activityName}. Saved automatically.`,
          );
          // UI will reset on next render naturally
        } else {
          // Fallback: If backend didn't stop it, we force reset
          await resetTimer(activeLog._id);
        }
        crashCheckRef.current = null;
      })();
      return;
    }

    // SCENARIO 2: > 5 Minutes (Ask User)
    if (
      activeLog.status === "active" &&
      gapDuration > APP_CONFIG.MIN_GAP_DURATION_FOR_CONFIRMATION_MS
    ) {
      // Stop ticking visually while we ask
      if (intervalRef.current) clearInterval(intervalRef.current);

      crashCheckRef.current = activeLog._id; // Lock it
      const minutesAway = Math.floor(gapDuration / (60 * 1000));
      const activityName =
        activities.find((a) => a._id === activeLog.activityId)?.name ||
        "Activity";

      confirm({
        title: "Timer Interrupted",
        message: `You were away for ${minutesAway} minutes. Do you want to continue (excluding the gap) or stop the timer for ${activityName}?`,
        confirmText: "Continue Session",
        type: "WARNING",

        onConfirm: async () => {
          // "Heal" the timer (Inject Pause).
          // This updates 'activityLogs', triggering this effect again with 0 gap.
          await resumeCrashedTimer(activeLog._id);
          crashCheckRef.current = null;
        },

        onCancel: async () => {
          // Stop the timer.
          // This updates 'activityLogs' to completed, triggering reset.
          await stopTimer(activeLog._id, lastHeartbeat); // Pass lastHeartbeat to be precise
          crashCheckRef.current = null;
        },
      });
      return;
    }

    // SCENARIO 3: Normal Operation (No Gap)
    // Clear lock and restore UI
    crashCheckRef.current = null;
    restoreStateFromLog(activeLog);
  }, [activityLogs, loading]);

  useEffect(() => {
    if (!isRunning) return;

    // FIX: Don't rely on 'selectedActivityId' state to find the log.
    // Use the reliable 'status' flag from the data source.
    const activeLog = activityLogs.find((log) => log.status === "active");

    if (!activeLog) return;

    const checkMidnight = setInterval(async () => {
      const now = new Date();
      const todayDateString = now.toDateString();

      // Check: Is it Midnight AND have we not split for this day yet?
      if (
        now.getHours() === 0 &&
        now.getMinutes() === 0 &&
        now.getSeconds() <= 2 &&
        lastSplitDateRef.current !== todayDateString
      ) {
        lastSplitDateRef.current = todayDateString; // Lock it immediately
        console.log("🕛 Midnight detected! Splitting timer...");

        // Calculate Boundaries
        const yesterdayEnd = new Date(now);
        yesterdayEnd.setHours(23, 59, 59, 999);
        yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);

        try {
          // 1. Stop current timer at 23:59:59 yesterday
          await stopTimer(activeLog._id, yesterdayEnd);

          // 2. Start new timer at 00:00:00 today
          // FIX: Pass 'todayStart' explicitly
          await startTimer(activeLog.activityId, todayStart);

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

// split timer
// 1. ongoing timer -- just log for previous day and start a new timer..
// 2. crashed timer -- if healing on a new day, log the previous entry and end it
// 3. paused timer -- if healing on a new day, log the previous entry and end it
