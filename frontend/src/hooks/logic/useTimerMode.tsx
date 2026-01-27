import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { useActivities } from "../data/useActivities";
import { useConfirm } from "../ui/useConfirmToast";

export const useTimerMode = () => {
  const { activities, loading } = useActivities();
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

  const handleChangeActivity = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedActivityId(e.target.value);
  };

  const handleStart = () => {
    if (!selectedActivityId) {
      toast.error("Please select an activity to start the timer");
      return;
    }
    if (isRunning) return;
    startRef.current = Date.now();
    setIsRunning(true);
    setIsPaused(false);
    setElapsed(0);
    setIsStartStopButtonDisabled(false);
    setIsPauseResumeButtonDisabled(false);
    setIsResetButtonDisabled(false);
    toast.success(
      `Started "${activities.find((a) => a._id === selectedActivityId)!.name}"`,
    );
    intervalRef.current = window.setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000) as unknown as number;
  };

  const handleStop = () => {
    if (!isRunning) return;
    const now = Date.now();
    const startedAt = startRef.current ?? now;
    const duration = Math.round((now - startedAt) / 1000);
    if (duration < 5) {
      toast.error("Duration too short to log (minimum 5 seconds)");
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
    confirm({
      // maybe write a function to convert duration to HH:MM:SS
      title: `Log ${duration} duration to ${activities.find((a) => a._id === selectedActivityId)?.name}`,
      message: `Log ${duration} duration to ${activities.find((a) => a._id === selectedActivityId)?.name}`,
      type: "INFO",
      confirmText: "Yes, Add Entry",
      onConfirm: () => {
        setSelectedActivityId("");
        setIsRunning(false);
        setElapsed(0);
        setIsPaused(false);
        setIsResetButtonDisabled(false);
        setIsPauseResumeButtonDisabled(false);
        setIsStartStopButtonDisabled(false);
        toast.success(
          `Logged ${duration} to ${activities.find((a) => a._id === selectedActivityId)?.name}`,
        );
      },
      onCancel: () => {
        setIsPaused(false);
        setIsResetButtonDisabled(false);
        setIsPauseResumeButtonDisabled(false);
        setIsStartStopButtonDisabled(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        startRef.current = Date.now() - elapsed * 1000;
        setIsRunning(true);
        intervalRef.current = window.setInterval(() => {
          setElapsed((prev) => prev + 1);
        }, 1000) as unknown as number;
      },
    });
  };

  const handlePauseResume = () => {
    if (!isRunning) return;
    if (!isPaused) {
      // Pause
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPaused(true);
    } else {
      // Resume
      startRef.current = Date.now() - elapsed * 1000;
      setIsPaused(false);
      intervalRef.current = window.setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000) as unknown as number;
    }
  };

  const handleResetTimer = () => {
    const now = Date.now();
    const startedAt = startRef.current ?? now;
    const duration = Math.round((now - startedAt) / 1000);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPaused(true);
    setIsResetButtonDisabled(true);
    setIsPauseResumeButtonDisabled(true);
    setIsStartStopButtonDisabled(true);

    confirm({
      // maybe write a function to convert duration to HH:MM:SS
      title: `Reset ${duration} duration for ${activities.find((a) => a._id === selectedActivityId)?.name}`,
      message: `Reset ${duration} duration for ${activities.find((a) => a._id === selectedActivityId)?.name}, this action is irreversible and will lose ${duration} duration for activity "${activities.find((a) => a._id === selectedActivityId)?.name}"`,
      type: "DANGER",
      confirmText: "Yes, Reset Timer",
      onConfirm: () => {
        // submitManualEntry(selectedActivityId, startTimeDate, endTimeDate); -- submit timer entry
        setSelectedActivityId("");
        setIsRunning(false);
        setElapsed(0);
        setIsPaused(false);
        setIsResetButtonDisabled(false);
        setIsPauseResumeButtonDisabled(false);
        setIsStartStopButtonDisabled(false);
        toast.success(
          `Reset ${duration} duration for ${activities.find((a) => a._id === selectedActivityId)?.name} to 00:00:00`,
        );
        setIsRunning(false);

        startRef.current = null;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      },
      onCancel: () => {
        setIsPaused(false);
        setIsResetButtonDisabled(false);
        setIsPauseResumeButtonDisabled(false);
        setIsStartStopButtonDisabled(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        startRef.current = Date.now() - elapsed * 1000;
        setIsRunning(true);
        intervalRef.current = window.setInterval(() => {
          setElapsed((prev) => prev + 1);
        }, 1000) as unknown as number;
      },
    });
  };

  return {
    activities,
    loading,
    selectedActivityId,
    handleChangeActivity,
    isRunning,
    setIsRunning,
    elapsed,
    setElapsed,
    isPaused,
    setIsPaused,
    intervalRef,
    isStartStopButtonDisabled,
    setIsStartStopButtonDisabled,
    isPauseResumeButtonDisabled,
    setIsPauseResumeButtonDisabled,
    isResetButtonDisabled,
    setIsResetButtonDisabled,
    startRef,
    handleStart,
    handleStop,
    handlePauseResume,
    handleResetTimer,
  };
};
