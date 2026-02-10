import React, { useEffect } from "react";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTimerMode } from "../hooks/logic/useTimerMode";
import LoadingSpinner from "./LoadingSpinner";
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Clock, 
  Zap,
  History 
} from "lucide-react";

/**
 * Formats seconds into HH:MM:SS time format.
 * @param seconds - Total seconds to format
 * @returns string - Formatted time string
 */
function formatTime(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return [hrs, mins, secs].map((n) => n.toString().padStart(2, "0")).join(":");
}

/**
 * Timer mode component for real-time activity tracking.
 * @returns JSX.Element
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
    handleStart,
    handleStop,
    handlePauseResume,
    handleResetTimer,
  } = useTimerMode();

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [intervalRef]);

  if (loading && activities.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  // Helper to find selected activity color
  const currentActivity = activities.find(a => a._id === selectedActivityId);
  const activeColor = currentActivity?.color || "#6366f1"; // Default indigo

  return (
    <div className="flex flex-col gap-8 mt-6 max-w-2xl mx-auto">
      
      {/* 1. Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl sm:text-4xl font-bold text-white flex items-center justify-center gap-3">
          <Clock className="w-8 h-8 text-blue-400" />
          <span className="text-gradient">Timer Mode</span>
        </h2>
        <p className="text-gray-300 text-base font-medium">
          Focus on your work, we'll handle the tracking
        </p>
      </div>

      {/* 2. Activity Selector Card */}
      <div className="glass rounded-2xl p-1 shadow-lg">
        <div className="bg-gray-900/60 rounded-xl p-6 sm:p-8 space-y-4 border border-white/5">
          <label htmlFor="timerActivity" className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Select Activity
          </label>
          
          <div className="relative group">
            <select
              id="timerActivity"
              value={selectedActivityId}
              onChange={handleChangeActivity}
              disabled={isRunning}
              className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
              style={{
                borderLeft: isRunning ? `4px solid ${activeColor}` : "1px solid rgba(255,255,255,0.1)"
              }}
            >
              <option value="" disabled>-- Choose what you're working on --</option>
              {activities.map((act) => (
                <option key={act._id} value={act._id} className="bg-gray-900 text-white">
                  {act.name}
                </option>
              ))}
            </select>
            {/* Custom Arrow Icon */}
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 3. The Timer Display */}
      <div className="relative group">
        {/* Glow Effect behind timer */}
        <div 
          className={`absolute inset-0 bg-gradient-to-r ${isRunning ? "from-blue-500/20 via-purple-500/20 to-pink-500/20" : "from-gray-800/20 to-gray-700/20"} rounded-3xl blur-2xl transition-all duration-1000`}
        />
        
        <div className="relative glass rounded-3xl p-10 sm:p-14 shadow-2xl border border-white/10 flex flex-col items-center justify-center gap-6">
          
          {/* Status Badge */}
          <div className={`
            px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border transition-all duration-500
            ${isRunning && !isPaused 
              ? "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse" 
              : isPaused 
                ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                : "bg-gray-800 text-gray-500 border-gray-700"}
          `}>
            {isRunning && !isPaused ? "Recording Live" : isPaused ? "Timer Paused" : "Ready to Start"}
          </div>

          {/* Time Display */}
          <div className="relative">
            <span className={`
              text-6xl sm:text-7xl lg:text-8xl font-mono font-bold tracking-tighter
              ${isRunning 
                ? "text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-100 to-indigo-200 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]" 
                : "text-gray-500"}
              transition-all duration-300
            `}>
              {formatTime(isRunning || isPaused ? elapsed : 0)}
            </span>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-4 mt-4 w-full justify-center">
            
            {!isRunning ? (
              // START BUTTON
              <button
                onClick={handleStart}
                disabled={!selectedActivityId}
                className="
                  group relative flex items-center gap-3 px-8 py-4 rounded-2xl 
                  bg-gradient-to-r from-indigo-500 to-purple-600 
                  text-white font-bold text-lg 
                  shadow-lg shadow-indigo-500/25 
                  hover:scale-[1.02] hover:shadow-indigo-500/40 active:scale-[0.98] 
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  transition-all duration-200 w-full sm:w-auto justify-center
                "
              >
                <Play className="w-6 h-6 fill-current" />
                <span>Start Session</span>
              </button>
            ) : (
              // CONTROLS (Pause, Stop, Reset)
              <>
                {/* Reset (Only if Paused) */}
                {isPaused && (
                  <button
                    onClick={handleResetTimer}
                    className="p-4 rounded-xl bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-white/5 transition-all hover:scale-105 active:scale-95"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-6 h-6" />
                  </button>
                )}

                {/* Pause / Resume */}
                <button
                  onClick={handlePauseResume}
                  className={`
                    flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98]
                    ${isPaused 
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                      : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20"}
                  `}
                >
                  {isPaused ? (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="w-5 h-5 fill-current" />
                      Pause
                    </>
                  )}
                </button>

                {/* Stop */}
                <button
                  onClick={handleStop}
                  className="
                    flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 rounded-xl 
                    bg-gradient-to-r from-red-500 to-pink-600 
                    text-white font-bold text-lg 
                    shadow-lg shadow-red-500/25 
                    hover:scale-[1.02] hover:shadow-red-500/40 active:scale-[0.98]
                    transition-all
                  "
                >
                  <Square className="w-5 h-5 fill-current" />
                  Stop
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 4. Mini Footer / Tip */}
      {!isRunning && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 opacity-60">
          <History className="w-4 h-4" />
          <p>Previous sessions are saved automatically to Logs</p>
        </div>
      )}

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
        toastClassName="bg-gray-900 border border-gray-800 text-white rounded-xl shadow-2xl"
      />
    </div>
  );
}

export default TimerMode;