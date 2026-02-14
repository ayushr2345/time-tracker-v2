import type { JSX } from "react";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useManualEntryMode } from "../hooks/logic/useManualEntryMode";
import LoadingSpinner from "./LoadingSpinner";
import { Edit3, Zap, Calendar, Clock, Save, ChevronDown } from "lucide-react";
import { APP_CONFIG } from "../constants";

/**
 * A form component for logging past activities manually.
 * @remarks
 * Allows users to record activities they forgot to track in real-time.
 * Supports "Today" and "Yesterday" quick selection to handle midnight edge cases easily.
 *
 * @returns The rendered Manual Entry page.
 */
function ManualEntryMode(): JSX.Element {
  const {
    activities,
    loading,
    selectedActivityId,
    handleChangeActivity,
    selectedDay,
    handleChangeDay,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    handleSubmitManualEntry,
  } = useManualEntryMode();

  // Helper: Find selected activity color for UI accents
  const currentActivity = activities.find((a) => a._id === selectedActivityId);
  const activeColor =
    currentActivity?.color || APP_CONFIG.DEFAULT_ACTIVITY_COLOR;

  // Helper: Create a synthetic event for the day toggle buttons
  const handleDayClick = (day: string) => {
    // We mock the event because the hook expects a ChangeEvent
    handleChangeDay({
      target: { value: day },
    } as React.ChangeEvent<HTMLSelectElement>);
  };

  // --- Render ---
  if (loading && activities.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-8 mt-6 max-w-2xl mx-auto px-4 sm:px-0">
      {/* 1. Page Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl sm:text-4xl font-bold text-white flex items-center justify-center gap-3">
          <Edit3 className="w-8 h-8 text-blue-400" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            Manual Entry
          </span>
        </h2>
        <p className="text-gray-400 text-base font-medium">
          Forgot to track? Add your past activities here.
        </p>
      </div>

      {/* 2. Main Form Card */}
      <div className="relative overflow-hidden bg-gray-900/40 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-2xl border border-white/10 space-y-8">
        {/* Ambient Background Glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Activity Selector */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 ml-1">
            <Zap className="w-4 h-4 text-yellow-400" />
            Activity
          </label>
          <div className="relative group">
            <select
              value={selectedActivityId}
              onChange={handleChangeActivity}
              className="w-full pl-5 pr-12 py-4 rounded-xl bg-gray-950/50 border border-white/10 text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer hover:bg-gray-900/80 hover:border-white/20"
              style={{
                borderLeft: selectedActivityId
                  ? `4px solid ${activeColor}`
                  : "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <option value="" disabled>
                -- Select Activity --
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
            {/* Custom Dropdown Arrow */}
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-hover:text-white transition-colors">
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Date & Time Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Day Selector (Toggle) */}
          <div className="space-y-3 sm:col-span-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 ml-1">
              <Calendar className="w-4 h-4 text-blue-400" />
              Date Context
            </label>
            <div className="flex gap-4 p-1 bg-gray-950/50 rounded-2xl border border-white/5">
              {["today", "yesterday"].map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={`
                    flex-1 py-3 px-4 rounded-xl transition-all text-sm font-bold uppercase tracking-wide
                    ${
                      selectedDay === day
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                        : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                    }
                  `}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Start Time Input */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 ml-1">
              <Clock className="w-4 h-4 text-emerald-400" />
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-5 py-3.5 rounded-xl bg-gray-950/50 border border-white/10 text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all [color-scheme:dark] hover:bg-gray-900/80 focus:bg-gray-900"
            />
          </div>

          {/* End Time Input */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 ml-1">
              <Clock className="w-4 h-4 text-rose-400" />
              End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-5 py-3.5 rounded-xl bg-gray-950/50 border border-white/10 text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all [color-scheme:dark] hover:bg-gray-900/80 focus:bg-gray-900"
            />
          </div>
        </div>

        {/* Submit Action */}
        <button
          onClick={handleSubmitManualEntry}
          disabled={!selectedActivityId || !startTime || !endTime}
          className={`
            w-full group relative flex items-center justify-center gap-3 px-8 py-5 rounded-2xl 
            text-white font-bold text-lg shadow-xl transition-all duration-300 mt-4
            ${
              !selectedActivityId || !startTime || !endTime
                ? "bg-gray-800 cursor-not-allowed opacity-50"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:scale-[1.02] hover:shadow-indigo-500/40 active:scale-[0.98]"
            }
          `}
        >
          <Save
            className={`w-5 h-5 ${!selectedActivityId || !startTime || !endTime ? "" : "group-hover:animate-bounce"}`}
          />
          <span>Save Entry</span>
        </button>
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
        toastClassName="!bg-gray-900 !border !border-gray-800 !text-white !rounded-xl !shadow-2xl"
      />
    </div>
  );
}

export default ManualEntryMode;
