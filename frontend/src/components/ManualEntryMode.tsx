import React, { useState } from "react";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import type { Activity } from "../types/activity";
import { getInitialActivities } from "../data/fixtures";

function ManualEntryMode() {
  const [activities] = useState<Activity[]>(getInitialActivities());
  const [selectedActivityId, setSelectedActivityId] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("today");

  const handleChangeDay = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDay(e.target.value);
  };

  const handleChangeActivity = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedActivityId(e.target.value);
  };

  const showConfirmAddEntry = (act: Activity, hours: number) => {
    const ConfirmAddEntry: React.FC<{
      act: { _id: string; name: string; color: string };
      onConfirm: () => void;
      onCancel: () => void;
    }> = ({ act, onConfirm, onCancel }) => {
      return (
        <div className="confirm-toast max-w-md w-full p-3">
          <div className="mb-2 text-white font-semibold">
            Log "{hours} hours" to "{act.name}" for "{selectedDay}"?
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
            `Saved manual entry for "${
              activities.find((a) => a._id === selectedActivityId)!.name
            }"`
          );
        }}
        onCancel={() => {
          toast.dismiss(toastId);
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
      // check these values are valid
      if (!startTime || !endTime) {
        toast.error("Please enter both start time and end time");
        return;
      }
      // Validations
      // Check if the start time is before end time
      const startTimeDate = new Date();
      startTimeDate.setHours(parseInt(startTime.split(":")[0], 10));
      startTimeDate.setMinutes(parseInt(startTime.split(":")[1], 10));

      const endTimeDate = new Date();
      endTimeDate.setHours(parseInt(endTime.split(":")[0], 10));
      endTimeDate.setMinutes(parseInt(endTime.split(":")[1], 10));

      // Adjust for yesterday if selected
      if (selectedDay === "yesterday") {
        startTimeDate.setDate(startTimeDate.getDate() - 1);
        endTimeDate.setDate(endTimeDate.getDate() - 1);
      }

      // Check for future times and logical correctness
      if (startTimeDate > new Date()) {
        toast.error("Start time cannot be in the future");
        return;
      }
      if (endTimeDate > new Date()) {
        toast.error("End time cannot be in the future");
        return;
      }
      if (startTimeDate >= endTimeDate) {
        toast.error("End time must be after start time");
        return;
      }

      const fiveMinutes = 5 * 60 * 1000;
      const twelveHours = 12 * 60 * 60 * 1000;
      const twentyFourHours = 24 * 60 * 60 * 1000;

      // Check for minimum duration of 5 minutes
      if (endTimeDate.getTime() - startTimeDate.getTime() <= fiveMinutes) {
        toast.error("At least 5 minutes of activity duration is required");
        return;
      }
      // Check for maximum duration of 12 hours
      if (endTimeDate.getTime() - startTimeDate.getTime() > twelveHours) {
        toast.warn(
          "Activity duration exceeds 12 hours. Please ensure this is correct."
        );
        const duration = endTimeDate.getTime() - startTimeDate.getTime();
        const durationHours =
          Math.round((duration / (1000 * 60 * 60)) * 100) / 100;
        showConfirmAddEntry(
          activities.find((a) => a._id === selectedActivityId)!,
          durationHours
        );
        return;
      }
      // Check for absolute maximum duration of 24 hours
      if (endTimeDate.getTime() - startTimeDate.getTime() > twentyFourHours) {
        toast.error("Activity duration cannot exceed 24 hours");
        return;
      }
    }
    toast.success(
      `Saved manual entry for "${
        activities.find((a) => a._id === selectedActivityId)!.name
      }"`
    );
  };

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
          id="day"
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

// TODO: Backend check to not allow overlapping manual entries for same activity or different activities
//       // The Schema Definition
// const LogSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   startTime: { type: Date, required: true },
//   endTime: { type: Date, required: true },
//   // ... other fields
// });

// // 🔥 THE MAGIC LINE (Compound Index)
// // This sorts data by User first, then by Start Time (descending).
// LogSchema.index({ userId: 1, startTime: -1 });
// --- more optimized solution would be to query for overlapping entries only on today and yesterday based on selected day

// TODO: All types of validations need to be done in backend too
// TODO: Add validation to ensure end time is after start time -- locally in frontend -- done
// TODO: Add validation to ensure start time or end time is not in the future -- locally in frontend and also in backend to be safe
// TODO: Add logic to convert time to UTC format and then store
// TODO: Make inputs field better designed (maybe date-time picker?)
// TODO: Add ability to select date (not just time) for entries ?? is it needed? -- only a toggle for today or yesterday for now
// TODO: Add ability to edit/delete manual entries after creation -- a new mode / tab for this feature
// TODO: Show summary of manual entries added in the current session
// TODO: Entries per Activity summary for manual entries and timer based entries separately and totally
// TODO: Add in overview, calendar view of all entries (manual + timer) for past 7 days with ability to hover and see details
// TODO: Add loading spinners on all tabs