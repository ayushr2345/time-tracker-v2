import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import type { Activity } from "../types/activity";
import { useActivities } from "../hooks/useActivities";
import { useConfirm } from "../hooks/useConfirmToast";
import type React from "react";

function Activities() {
  const {
    activities,
    loading,
    name,
    setName,
    selectedColor,
    setSelectedColor,
    presetColors,
    addActivity,
    deleteActivity,
  } = useActivities();

  const { confirm } = useConfirm();

  const handleSubmit = async (newActivity: Omit<Activity, "_id">) => {
    await addActivity(newActivity);
    setName("");
    setSelectedColor("#6366f1");
  };

  const handleDelete = (act: Activity) => {
    confirm({
      title: `Delete "${act.name}"?`,
      message:
        "This action cannot be undone. Type the activity name to confirm.",
      type: "DANGER",
      requireInput: true,
      matchText: act.name,
      confirmText: "Delete",
      onConfirm: async () => {
        await deleteActivity(act._id);
      },
      onCancel: () => {},
    });
  };

  if (loading && activities.length === 0) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex flex-col gap-6 mt-6 max-w-3xl mx-auto">
        {/* Heading */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold text-white flex items-center justify-center gap-3">
            <span className="text-3xl">🎯</span>
            <span className="text-gradient">Activities</span>
          </h2>
          <p className="text-gray-300 text-base font-medium">
            Manage your tracked activities
          </p>
        </div>

        {/* Add Activity Form */}
        <div className="glass rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
          <h3 className="text-lg font-bold text-white flex items-center gap-3">
            <span className="text-xl">➕</span>
            <span>Add New Activity</span>
          </h3>
          <div className="flex flex-col gap-5">
            <input
              type="text"
              placeholder="Enter activity name..."
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              className="w-full px-5 py-4 rounded-xl glass text-white border border-white/20 placeholder:text-gray-400 placeholder:opacity-70 bg-white/5 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 hover:border-white/40 hover:bg-white/5 font-medium"
            />
            <div className="flex flex-col gap-3">
              <label className="text-base font-bold text-white flex items-center gap-3">
                <span className="text-xl">🎨</span>
                <span>Choose Color</span>
              </label>
              <div className="flex items-center gap-4">
                {/* Preset Colors */}
                <div className="flex gap-2 flex-wrap flex-1">
                  {presetColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => {
                        setSelectedColor(color.value);
                      }}
                      className="w-10 h-10 rounded-xl border-2 border-white/20 hover:border-white/60 transition-all shadow-lg hover:scale-110 active:scale-95 cursor-pointer"
                      style={{
                        backgroundColor: color.value,
                        boxShadow: `0 0 15px ${color.value}40`,
                      }}
                      title={color.name}
                    />
                  ))}
                </div>
                {/* Custom Color Picker */}
                <div className="flex items-center gap-3">
                  <label
                    className="text-sm text-gray-300 font-medium whitespace-nowrap"
                  >
                    Custom:
                  </label>
                  <div className="relative">
                    <input
                      type="color"
                      defaultValue="#6366f1"
                      className="w-14 h-14 rounded-xl border-2 border-white/20 cursor-pointer hover:border-white/60 transition-all shadow-lg hover:scale-110 opacity-0 absolute z-10"
                      onChange={(e) => {
                        setSelectedColor(e.target.value);
                      }}
                    />
                      🎨
                  </div>
                </div>
              </div>
              {/* Color Preview */}
              <div className="flex items-center gap-3 px-4 py-3 glass rounded-xl border border-white/10">
                <span className="text-sm text-gray-300 font-medium">
                  Preview:
                </span>
                <div
                  id="colorPreview"

                  className="w-8 h-8 rounded-full border-2 border-white/30 shadow-lg transition-all"
                  style={{
                    backgroundColor: selectedColor,
                    boxShadow: `0 0 15px ${selectedColor}40`,
                  }}
                ></div>
                <span
                  id="colorValue"
                  className="text-sm text-white font-mono font-semibold ml-auto"
                >
                  {selectedColor.toUpperCase()}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!name.trim()) {
                  toast.error("Activity name cannot be empty.");
                  return;
                }
                handleSubmit({ name: name.trim(), color: selectedColor });
              }}
              className="bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white px-8 py-5 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap flex items-center justify-center gap-3"
            >
              <span className="text-xl">➕</span>
              <span>Add Activity</span>
            </button>
          </div>
        </div>

        {/* Activities List */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-3">
            <span className="text-xl">📋</span>
            <span>Your Activities ({activities.length})</span>
          </h3>
          {activities.length === 0 ? (
            <div className="glass rounded-xl p-10 text-center shadow-xl">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-linear-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-10 h-10 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <p className="text-white font-semibold text-lg">
                  No activities yet
                </p>
                <p className="text-gray-400 text-sm">
                  Create your first activity above!
                </p>
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {activities.map((act) => (
                <li
                  key={act._id}
                  className="group glass rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex justify-between items-center"
                  style={{
                    borderLeft: `4px solid ${act.color}`,
                    boxShadow: `0 4px 20px ${act.color}30, 0 0 0 1px rgba(255,255,255,0.1)`,
                  }}
                >
                  <span className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      className="w-5 h-5 rounded-full shrink-0 transition-all"
                      style={{
                        backgroundColor: act.color,
                        boxShadow: `0 0 15px ${act.color}80`,
                      }}
                    ></div>
                    <span className="font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all truncate text-lg">
                      {act.name}
                    </span>
                  </span>
                  <button
                    onClick={() => handleDelete(act)}
                    className="ml-4 px-5 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all duration-300 font-bold text-sm flex items-center gap-2 hover:scale-105 active:scale-95"
                  >
                    <span className="text-lg">❌</span>
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </li>
              ))}
            </ul>
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
    </div>
  );
}

export default Activities;
