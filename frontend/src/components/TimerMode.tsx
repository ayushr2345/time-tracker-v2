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
    setElapsed(0);
    toast.success(
      `Started "${activities.find((a) => a.id === selectedActivityId)!.name}"`
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
    toast.success(
      `Saved "${
        activities.find((a) => a.id === selectedActivityId)!.name
      }" — ${formatTime(duration)}`
    );

    setIsRunning(false);
    setElapsed(0);
    startRef.current = null;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
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
              key={act.id}
              value={act.id}
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
        <div className="relative glass rounded-2xl p-10 sm:p-14 text-center shadow-2xl">
          <div className="text-5xl sm:text-6xl lg:text-7xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient">
            {formatTime(isRunning ? elapsed : 0)}
          </div>
          {isRunning && (
            <div className="mt-5 flex items-center justify-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
              <span className="text-base text-gray-300 font-semibold">
                Recording...
              </span>
            </div>
          )}
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






// TODO: Add ability for heartbeat sounds when starting/stopping timer
// TODO: Add heartbeat to server for sudden failures/crashes
// TODO: Add confirmation modal when stopping timer
// TODO: Add option to discard current timer instead of saving
// TODO: Add option to continue previous timer if stopped accidentally
// TODO: Add option to pause and resume timer -- if adding this, implement confirmation modal on stop to avoid confusion
// TODO: Add visual indicator on activity select when timer is running
