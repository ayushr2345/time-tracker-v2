import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useManualEntryMode } from "../hooks/logic/useManualEntryMode";
import LoadingSpinner from "./LoadingSpinner";
import { Edit3, Zap, Calendar, Clock, Save, ArrowRight } from "lucide-react";
import { APP_CONFIG } from "../constants";

/**
 * Manual entry mode component for logging past activities.
 * @returns JSX.Element
 */
function ManualEntryMode() {
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

  if (loading && activities.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  // Helper to find selected activity color
  const currentActivity = activities.find((a) => a._id === selectedActivityId);
  const activeColor =
    currentActivity?.color || APP_CONFIG.DEFAULT_ACTIVITY_COLOR;

  return (
    <div className="flex flex-col gap-8 mt-6 max-w-2xl mx-auto">
      {/* 1. Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl sm:text-4xl font-bold text-white flex items-center justify-center gap-3">
          <Edit3 className="w-8 h-8 text-blue-400" />
          <span className="text-gradient">Manual Entry</span>
        </h2>
        <p className="text-gray-300 text-base font-medium">
          Forgot to track? Add past activities here.
        </p>
      </div>

      {/* 2. Main Form Card */}
      <div className="glass rounded-3xl p-6 sm:p-10 shadow-2xl border border-white/10 space-y-8 relative overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10" />

        {/* Activity Selector */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Activity
          </label>
          <div className="relative group">
            <select
              value={selectedActivityId}
              onChange={handleChangeActivity}
              className="w-full px-5 py-4 rounded-xl bg-gray-900/50 border border-white/10 text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer hover:bg-gray-900/70"
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
            {/* Custom Arrow */}
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-hover:text-white transition-colors">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Date & Time Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Day Selector */}
          <div className="space-y-3 sm:col-span-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              Date
            </label>
            <div className="flex gap-4">
              {["today", "yesterday"].map((day) => (
                <button
                  key={day}
                  onClick={() =>
                    handleChangeDay({ target: { value: day } } as any)
                  }
                  className={`flex-1 py-3 px-4 rounded-xl border transition-all text-sm font-bold uppercase tracking-wide
                    ${
                      selectedDay === day
                        ? "bg-blue-500/20 border-blue-500 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                        : "bg-gray-900/30 border-white/5 text-gray-500 hover:bg-gray-900/50 hover:text-gray-300"
                    }
                  `}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Start Time */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-5 py-3.5 rounded-xl bg-gray-900/50 border border-white/10 text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all [color-scheme:dark] hover:bg-gray-900/70"
            />
          </div>

          {/* End Time */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-400" />
              End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-5 py-3.5 rounded-xl bg-gray-900/50 border border-white/10 text-white font-mono focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all [color-scheme:dark] hover:bg-gray-900/70"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmitManualEntry}
          disabled={!selectedActivityId || !startTime || !endTime}
          className="
            w-full group relative flex items-center justify-center gap-3 px-8 py-5 rounded-2xl 
            bg-gradient-to-r from-indigo-500 to-purple-600 
            text-white font-bold text-lg 
            shadow-lg shadow-indigo-500/25 
            hover:scale-[1.02] hover:shadow-indigo-500/40 active:scale-[0.98] 
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            transition-all duration-200 mt-4
          "
        >
          <Save className="w-5 h-5 group-hover:animate-bounce-subtle" />
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
        toastClassName="bg-gray-900 border border-gray-800 text-white rounded-xl shadow-2xl"
      />
    </div>
  );
}

export default ManualEntryMode;
