import React, { useEffect, useRef, useState } from "react";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import type { Activity } from "../types/activity";
import { getInitialActivities } from "../data/fixtures";

function formatTime(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return [hrs, mins, secs].map((n) => n.toString().padStart(2, "0")).join(":");
}

function TimerMode() {
  const [activities] = useState<Activity[]>(getInitialActivities());
  const [selectedActivityId, setSelectedActivityId] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [isStopSubmitButtonDisabled, setIsStopSubmitButtonDisabled] =
    useState(false);
  const [isPaused, setIsPaused] = useState(true);

  const intervalRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  const handleChangeActivity = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedActivityId(e.target.value);
  };

  const showConfirmAddEntry = (act: Activity, duration: string) => {
    const ConfirmAddEntry: React.FC<{
      act: { _id: string; name: string; color: string };
      onConfirm: () => void;
      onCancel: () => void;
    }> = ({ act, onConfirm, onCancel }) => {
      return (
        <div className="confirm-toast max-w-md w-full p-3">
          <div className="mb-2 text-white font-semibold">
            Log "{duration} duration" to "{act.name}"?
          </div>
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={onCancel}
              className="px-3 py-2 rounded-lg bg-red-500 text-white font-bold"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm()}
              className="px-3 py-2 rounded-lg bg-green-500 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </div>
      );
    };

    let toastId: string | number | undefined;
    toastId = toast(
      <ConfirmAddEntry
        act={act}
        onConfirm={() => {
          toast.dismiss(toastId);
          toast.success(
            `Saved "${
              activities.find((a) => a._id === selectedActivityId)!.name
            }" — ${duration}`
          );

          setIsRunning(false);
          setElapsed(0);
          setIsPaused(true);
          setIsStopSubmitButtonDisabled(false);
          startRef.current = null;
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }}
        onCancel={() => {
          toast.dismiss(toastId);
          setIsStopSubmitButtonDisabled(false);
          setIsPaused(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          startRef.current = Date.now() - elapsed * 1000;
          setIsRunning(true);
          intervalRef.current = window.setInterval(() => {
            setElapsed((prev) => prev + 1);
          }, 1000) as unknown as number;
        }}
      />,
      {
        autoClose: false,
        closeOnClick: false,
        pauseOnHover: true,
        closeButton: false,
        draggable: false,
      }
    );
  };

  const showConfirmResetEntry = (act: Activity, duration: string) => {
    const ConfirmAddEntry: React.FC<{
      act: { _id: string; name: string; color: string };
      onConfirm: () => void;
      onCancel: () => void;
    }> = ({ act, onConfirm, onCancel }) => {
      return (
        <div className="confirm-toast max-w-md w-full p-3">
          <div className="mb-2 text-white font-semibold">
            Reset "{duration} duration" of "{act.name}"?
          </div>
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={onCancel}
              className="px-3 py-2 rounded-lg bg-red-500 text-white font-bold"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm()}
              className="px-3 py-2 rounded-lg bg-green-500 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
          </div>
        </div>
      );
    };

    let toastId: string | number | undefined;
    toastId = toast(
      <ConfirmAddEntry
        act={act}
        onConfirm={() => {
          toast.dismiss(toastId);
          toast.success(
            `Reset "${activities.find((a) => a._id === selectedActivityId)!.name}" timer.`
          );

          setIsRunning(false);
          setElapsed(0);
          setIsPaused(true);
          setIsStopSubmitButtonDisabled(false);
          startRef.current = null;
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }}
        onCancel={() => {
          toast.dismiss(toastId);
          setIsStopSubmitButtonDisabled(false);
          setIsPaused(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          startRef.current = Date.now() - elapsed * 1000;
          setIsRunning(true);
          intervalRef.current = window.setInterval(() => {
            setElapsed((prev) => prev + 1);
          }, 1000) as unknown as number;
        }}
      />,
      {
        autoClose: false,
        closeOnClick: false,
        pauseOnHover: true,
        closeButton: false,
        draggable: false,
      }
    );
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
    toast.success(
      `Started "${activities.find((a) => a._id === selectedActivityId)!.name}"`
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
    setIsStopSubmitButtonDisabled(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPaused(true);
    showConfirmAddEntry(
      activities.find((a) => a._id === selectedActivityId)!,
      formatTime(duration)
    );
  };

  const handlePauseResumeClick = () => {
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
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    showConfirmResetEntry(
      activities.find((a) => a._id === selectedActivityId)!,
      formatTime(elapsed)
    );
    
    // setIsRunning(false);
    // setElapsed(0);
    // setIsPaused(true);
    // startRef.current = null;
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 mt-6 max-w-3xl mx-auto">
      {/* Heading */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl sm:text-4xl font-bold text-white flex items-center justify-center gap-3">
          <span className="text-3xl">⏳</span>
          <span className="text-gradient">Timer Mode</span>
        </h2>
        <p className="text-gray-300 text-base font-medium">
          Track focused time and save local entries
        </p>
      </div>

      {/* Activity Selector */}
      <div className="glass rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-3">
          <span className="text-xl">🔍</span>
          <span>Select Activity</span>
        </h3>
        <select
          id="timerActivity"
          value={selectedActivityId}
          onChange={handleChangeActivity}
          className="w-full px-5 py-4 rounded-xl glass text-white border border-white/20 bg-white/5 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 hover:border-white/40 hover:bg-white/5 font-medium appearance-none cursor-pointer"
        >
          <option value="" disabled>
            -- Select an Activity --
          </option>
          {activities.map((act) => (
            <option
              key={act._id}
              value={act._id}
              className="bg-gray-900 text-white"
            >
              {act.name}
            </option>
          ))}
        </select>
      </div>

      {/* Timer Display */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50 animate-pulse-glow"></div>
        <div className="relative glass rounded-2xl p-10 sm:p-14 shadow-2xl">
          <div className="flex flex-col items-center justify-between">
            {/* Timer Display - Center */}
            <div className="text-5xl sm:text-6xl lg:text-7xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient text-center w-full">
              {formatTime(isRunning ? elapsed : 0)}
            </div>

            {/* Recording Status - Center */}
            {isRunning && (
              <div className="mt-5 flex items-center justify-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                <span className="text-base text-gray-300 font-semibold">
                  Recording...
                </span>
              </div>
            )}
          </div>

          {/* Pause/Resume Button - Top Right */}
          {!isPaused || elapsed > 0 ? (
            <button
              onClick={handlePauseResumeClick}
              className="justify-center absolute top-5 right-5 bg-gradient-to-r from-purple-500/70 to-pink-500/70 hover:from-purple-600 hover:to-pink-600 text-white w-12 h-12 rounded-full flex items-center transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
            >
              {!isPaused ? (
                <span className="text-2xl">⏸</span>
              ) : (
                <span className="text-2xl">▶</span>
              )}
            </button>
          ) : null}
          {/* Reset Button - Top Left */}
          {elapsed > 0 && (
          <div className="justify-center absolute top-5 left-5">
            <button
              onClick={handleResetTimer}
              disabled={elapsed === 0 && !isRunning}
              className="bg-gradient-to-r from-purple-500/70 to-pink-500/70 hover:from-purple-600 hover:to-pink-600 text-white w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
            >
              <span className="text-2xl">🔄</span>
            </button>
          </div>) || null}
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-4">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="w-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white px-8 py-5 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <span className="text-2xl">▶️</span>
            <span>Start Timer</span>
          </button>
        ) : (
          <button
            onClick={handleStop}
            disabled={isStopSubmitButtonDisabled}
            className="w-full bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 hover:from-red-600 hover:via-pink-600 hover:to-rose-600 text-white px-8 py-5 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-red-500/50 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 animate-pulse-glow"
          >
            <span className="text-2xl">⏹</span>
            <span>Stop & Save</span>
          </button>
        )}
      </div>

      <ToastContainer
        transition={Slide}
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

export default TimerMode;

// TODO: RESET logic, similar to pause and resume logic, disable button, pause timer, if cancelled, resume timer, if confirmed, reset timer and stop it.

// TODO: Overnight edge case: Start timer before midnight, stop after midnight - handle correctly
//       look up where the time spent should go (previous day vs current day) based on greater portion of time spent
//       or split into two records automatically -- option B is better as it maintains accuracy -- no overflow of time in a single day
// TODO: Add ability for heartbeat sounds when starting/stopping timer
// TODO: Add heartbeat to server for sudden failures/crashes
// TODO: Add confirmation modal when stopping timer
// TODO: Add option to discard current timer instead of saving
// TODO: Add option to continue previous timer if stopped accidentally
// TODO: Add option to pause and resume timer -- if adding this, implement confirmation modal on stop to avoid confusion
// TODO: Add visual indicator on activity select when timer is running
// TODO: Pause and Resume functionality
//   - Pause button to stop timer without saving but retain elapsed time
//   - Resume button to continue from paused time
//   - On Stop, save total elapsed time from start to stop, excluding paused duration
//   - Update UI to show paused state clearly
// TODO: Ensure Stop button diabled when clicked to avoid multiple clicks / but also if toast cancelled, re-enable it -- done
// TODO: Add pause history and in schema, use that to calculate total duration in case of timer entries. add type of entry also
// TODO: Duration in case of pauses... duration = endtime - starttime - sum of all paused durations
// TODO: In case of crash/tab close/browser close/shutdown - use heartbeat to calculate last known time and use that as endtime
// TODO: In case of someone forget to stop timer, on reload, run a query to check active timers and last heartbeart, if greater than X mins, stop it automatically

// someone forgets to end timer ----  Better Approach: The Server cleans up, not the Client.

// The "Reaper" Job: Your backend should have a setInterval running every 5 minutes.

// Logic: "Find all active logs where lastHeartbeat is older than 5 minutes. Close them immediately."

// Why: This keeps your analytics accurate even if you don't open the app for a week.

// missed scenario: someone paused the timer and forgets to stop it. // In this case, the timer will keep running in the background. -- can be checked by reaper mentioned above

// REAPER: every 5 or 10 mins, finds all logs with active status, lastHeartbeat older than 5 mins, and closes them using lastHeartbeat as endTime.
// REAPER: every 5 or 10 mins, finds all logs with paused status, lastHeartbeat older than 5 mins, and closes them using pauseStart as endTime.

// missed scenario: timer is paused and app crashes/closes. --
// ou missed one specific scenario: What if the app crashes while PAUSED?

// Scenario: You start timer ➡️ Work 1 hour ➡️ Pause ➡️ Close Tab.

// The Problem: The heartbeat stops. The "Reaper" wakes up 10 mins later and sees the heartbeat is old.

// The Fix:

// If status is Active ➡️ endTime = lastHeartbeat.

// If status is Paused ➡️ endTime = pauseStart (Because no work happened after you clicked pause).

// Revised Implementation Plan

// Frontend:

// Send heartbeat every 60s (Include status in the payload).

// Backend "Reaper" (Cron/Interval):

// Run every 5 mins.

// Find "stale" logs (now - lastHeartbeat > 5 mins).

// If Active: Close log using lastHeartbeat as endTime.

// If Paused: Close log using the last pauseStart from the pauseHistory array as endTime.

// Add the "Paused Zombie" logic to your list, and you are ready to code! 💻
