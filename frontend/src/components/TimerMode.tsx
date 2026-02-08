import { useEffect } from "react";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTimerMode } from "../hooks/logic/useTimerMode";

/**
 * Formats seconds into HH:MM:SS time format.
 * @param seconds           - Total seconds to format
 * @returns string          - Formatted time string in HH:MM:SS format
 */
function formatTime(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return [hrs, mins, secs].map((n) => n.toString().padStart(2, "0")).join(":");
}

/**
 * Timer mode component for real-time activity tracking.
 * @remarks
 * Provides a live timer interface with start, pause, resume, and stop functionality.
 * Manages timer state and user interactions for activity tracking.
 * @returns JSX.Element  - The timer mode interface
 */
function TimerMode() {
  const {
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
  } = useTimerMode();

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (loading && activities.length === 0) return <div>Loading...</div>;

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
          {isRunning ? (
            <button
              disabled={isPauseResumeButtonDisabled}
              onClick={handlePauseResume}
              className="justify-center absolute top-5 right-5 bg-gradient-to-r from-purple-500/70 to-pink-500/70 hover:from-purple-600 hover:to-pink-600 text-white w-12 h-12 rounded-full flex items-center transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
            >
              {!isPaused ? (
                <span className="text-2xl">⏸</span>
              ) : (
                <span className="text-2xl">▶</span>
              )}
            </button>
          ) : null}
          {/* Reset Button - Top Left */}
          {(isRunning && (
            <div className="justify-center absolute top-5 left-5">
              <button
                onClick={handleResetTimer}
                disabled={
                  (elapsed === 0 && !isRunning) || isResetButtonDisabled
                }
                className="bg-gradient-to-r from-purple-500/70 to-pink-500/70 hover:from-purple-600 hover:to-pink-600 text-white w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
              >
                <span className="text-2xl">🔄</span>
              </button>
            </div>
          )) ||
            null}
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
            disabled={isStartStopButtonDisabled}
            className="w-full bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 hover:from-red-600 hover:via-pink-600 hover:to-rose-600 text-white px-8 py-5 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-red-500/50 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 animate-pulse-glow disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
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
