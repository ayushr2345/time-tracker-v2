import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useManualEntryMode } from "../hooks/logic/useManualEntryMode";

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

  if (loading && activities.length === 0) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-6 mt-6 max-w-3xl mx-auto">
      {/* Heading */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl sm:text-4xl font-bold text-white flex items-center justify-center gap-3">
          <span className="text-3xl">📝</span>
          <span className="text-gradient">Manual Entry</span>
        </h2>
        <p className="text-gray-300 text-base font-medium">
          Add time entries manually
        </p>
      </div>

      {/* Activity Selector */}
      <div className="glass rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-3">
          <span className="text-xl">🔍</span>
          <span>Select Activity</span>
        </h3>
        <select
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

      {/* Day input (Today(default) / Yesterday (1 day grace)) */}
      <div className="flex flex-col gap-4">
        <label
          htmlFor="day"
          className="text-base font-bold text-white flex items-center gap-3"
        >
          <span className="text-xl">📅</span>
          <span>Day</span>
        </label>
        <select
          value={selectedDay}
          onChange={handleChangeDay}
          className="w-full px-5 py-4 rounded-xl glass text-white border border-white/20 bg-white/5 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 hover:border-white/40 hover:bg-white/5 font-medium appearance-none cursor-pointer"
        >
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
        </select>
      </div>

      {/* Time Inputs Side by Side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-4">
          <label className="text-base font-bold text-white flex items-center gap-3">
            <span className="text-xl">⏰</span>
            <span>Start Time</span>
          </label>
          <input
            type="time"
            value={startTime}
            placeholder="09:00"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setStartTime(e.target.value)
            }
            className="w-full px-5 py-4 rounded-xl glass text-white border border-white/20 bg-white/5 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 hover:border-white/40 hover:bg-white/5 font-medium"
          />
        </div>

        <div className="flex flex-col gap-4">
          <label
            htmlFor="endTime"
            className="text-base font-bold text-white flex items-center gap-3"
          >
            <span className="text-xl">🛑</span>
            <span>End Time</span>
          </label>
          <input
            type="time"
            value={endTime}
            placeholder="17:00"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEndTime(e.target.value)
            }
            className="w-full px-5 py-4 rounded-xl glass text-white border border-white/20 bg-white/5 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 hover:border-white/40 hover:bg-white/5 font-medium"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="space-y-4">
        <button
          onClick={handleSubmitManualEntry}
          className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white px-8 py-5 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
        >
          <span className="text-2xl">➕</span>
          <span>Save Manual Entry</span>
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
      />
    </div>
  );
}

export default ManualEntryMode;

// TODO: Make inputs field better designed (maybe date-time picker?)
// TODO: Add ability to edit/delete manual entries after creation -- a new mode / tab for this feature
// TODO: Entries per Activity summary for manual entries and timer based entries separately and totally
// TODO: Add in overview, calendar view of all entries (manual + timer) for past 7 days with ability to hover and see details
// TODO: Add loading spinners on all tabs
