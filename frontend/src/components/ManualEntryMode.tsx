import React, { useState } from "react";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import type { Activity } from "../types/activity";
import { getInitialActivities } from "../data/fixtures";

function ManualEntryMode() {
  const [activities] = useState<Activity[]>(getInitialActivities());
  const [selectedActivityId, setSelectedActivityId] = useState<string>("");

  const handleChangeActivity = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedActivityId(e.target.value);
  };

  const handleSubmit = () => {
    if (!selectedActivityId) {
      toast.error("Please select an activity to save the manual entry");
      return;
    }
    const startTimeInput = document.getElementById(
      "startTime"
    ) as HTMLInputElement | null;
    const endTimeInput = document.getElementById(
      "endTime"
    ) as HTMLInputElement | null;

    if (startTimeInput && endTimeInput) {
      const startTime = startTimeInput.value;
      const endTime = endTimeInput.value;

      if (!startTime || !endTime) {
        toast.error("Please enter both start time and end time");
        return;
      }
      console.log(startTime, endTime);
    }
    toast.success(
      `Saved manual entry for "${
        activities.find((a) => a.id === selectedActivityId)!.name
      }"`
    );
  };

  return (
    <div className="mt-6 max-w-2xl mx-auto space-y-8">
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

      {/* Time Inputs Side by Side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-4">
          <label
            htmlFor="startTime"
            className="text-base font-bold text-white flex items-center gap-3"
          >
            <span className="text-xl">⏰</span>
            <span>Start Time</span>
          </label>
          <input
            id="startTime"
            type="time"
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
            id="endTime"
            type="time"
            className="w-full px-5 py-4 rounded-xl glass text-white border border-white/20 bg-white/5 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 hover:border-white/40 hover:bg-white/5 font-medium"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="space-y-4">
        <button
          onClick={handleSubmit}
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

// TODO: Add validation to ensure end time is after start time
// TODO: Add validation to ensure end time is not in the future
// TODO: Add logic to convert time to UTC format and then store
// TODO: Make inputs field better designed (maybe date-time picker?)
// TODO: Add ability to select date (not just time) for entries ?? is it needed?
// TODO: Add ability to enter duration instead of start/end times
// TODO: Add ability to edit/delete manual entries after creation -- a new mode / tab for this feature