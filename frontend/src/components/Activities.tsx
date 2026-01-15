import { useState } from "react";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import type { Activity } from "../types/activity";
import { getInitialActivities } from "../data/fixtures";

function Activities() {
  const [activities, setActivities] = useState<Activity[]>(getInitialActivities());

  const showDeleteConfirm = (act: Activity) => {
    const ConfirmDeleteToast: React.FC<{
      act: { id: string; name: string };
      onConfirm: () => void;
      onCancel: () => void;
    }> = ({ act, onConfirm, onCancel }) => {
      const [value, setValue] = useState("");
      return (
        <div className="confirm-toast max-w-md w-full p-3">
          <div className="mb-2 text-white font-semibold">Delete "{act.name}"?</div>
          <div className="mb-3 text-gray-300 text-sm">Type the activity name to confirm.</div>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`Type ${act.name} to confirm`}
            className="w-full px-3 py-2 rounded-md bg-white/6 text-white placeholder-gray-400 mb-3 border border-white/10"
          />
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={onCancel}
              className="px-3 py-2 rounded-lg bg-white/10 text-white font-bold"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm()}
              disabled={value !== act.name}
              className="px-3 py-2 rounded-lg bg-red-500 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete
            </button>
          </div>
        </div>
      );
    };

    let toastId: string | number | undefined;
    toastId = toast(
      <ConfirmDeleteToast
        act={act}
        onConfirm={() => {
          setActivities((prev) => prev.filter((a) => a.id !== act.id));
          toast.dismiss(toastId);
          toast.success(`Deleted "${act.name}"`);
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
              id="newActivityName"
              type="text"
              placeholder="Enter activity name..."
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
                  {[
                    { name: "Blue", value: "#3b82f6" },
                    { name: "Purple", value: "#8b5cf6" },
                    { name: "Pink", value: "#ec4899" },
                    { name: "Emerald", value: "#10b981" },
                    { name: "Amber", value: "#f59e0b" },
                    { name: "Cyan", value: "#06b6d4" },
                    { name: "Orange", value: "#f97316" },
                    { name: "Violet", value: "#a855f7" },
                  ].map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => {
                        const colorInput = document.getElementById(
                          "newActivityColor"
                        ) as HTMLInputElement | null;
                        const colorPreview = document.getElementById(
                          "colorPreview"
                        ) as HTMLElement | null;
                        const colorValue = document.getElementById(
                          "colorValue"
                        ) as HTMLElement | null;
                        const colorLabel = document.getElementById(
                          "colorLabelPreview"
                        ) as HTMLElement | null;

                        if (colorInput) {
                          colorInput.value = color.value;
                          if (colorPreview) {
                            colorPreview.style.backgroundColor = color.value;
                            colorPreview.style.boxShadow = `0 0 15px ${color.value}66`;
                          }
                          if (colorValue) {
                            colorValue.textContent = color.value.toUpperCase();
                          }
                          if (colorLabel) {
                            colorLabel.style.backgroundColor = color.value;
                            colorLabel.style.boxShadow = `0 0 15px ${color.value}66`;
                          }
                          colorInput.dispatchEvent(
                            new Event("input", { bubbles: true })
                          );
                        }
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
                    htmlFor="newActivityColor"
                    className="text-sm text-gray-300 font-medium whitespace-nowrap"
                  >
                    Custom:
                  </label>
                  <div className="relative">
                    <input
                      id="newActivityColor"
                      type="color"
                      defaultValue="#6366f1"
                      className="w-14 h-14 rounded-xl border-2 border-white/20 cursor-pointer hover:border-white/60 transition-all shadow-lg hover:scale-110 opacity-0 absolute z-10"
                      onChange={(e) => {
                        const color = e.target.value;
                        const colorPreview = document.getElementById(
                          "colorPreview"
                        ) as HTMLElement | null;
                        const colorValue = document.getElementById(
                          "colorValue"
                        ) as HTMLElement | null;
                        const colorLabel = document.getElementById(
                          "colorLabelPreview"
                        ) as HTMLElement | null;

                        if (colorPreview) {
                          colorPreview.style.backgroundColor = color;
                          colorPreview.style.boxShadow = `0 0 15px ${color}66`;
                        }
                        if (colorValue) {
                          colorValue.textContent = color.toUpperCase();
                        }
                        if (colorLabel) {
                          colorLabel.style.backgroundColor = color;
                          colorLabel.style.boxShadow = `0 0 15px ${color}66`;
                        }
                      }}
                    />
                    <label
                      htmlFor="newActivityColor"
                      id="colorLabelPreview"
                      className="w-14 h-14 rounded-xl border-2 border-white/20 cursor-pointer hover:border-white/60 transition-all shadow-lg hover:scale-110 flex items-center justify-center text-white text-xs font-bold pointer-events-none"
                      style={{
                        backgroundColor: "#6366f1",
                        boxShadow: "0 0 15px rgba(99, 102, 241, 0.4)",
                      }}
                    >
                      🎨
                    </label>
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
                    backgroundColor: "#6366f1",
                    boxShadow: "0 0 15px rgba(99, 102, 241, 0.4)",
                  }}
                ></div>
                <span
                  id="colorValue"
                  className="text-sm text-white font-mono font-semibold ml-auto"
                >
                  #6366F1
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                const nameInput = document.getElementById(
                  "newActivityName"
                ) as HTMLInputElement | null;
                const colorInput = document.getElementById(
                  "newActivityColor"
                ) as HTMLInputElement | null;

                if (nameInput && colorInput) {
                  const name = nameInput.value.trim();
                  const color = colorInput.value || "#6366f1";
                    if (!name) {
                      toast.error("Please enter an activity name");
                      return;
                    }

                    if (name && color) {
                      const newActivity = {
                        id: Date.now().toString(),
                        name,
                        color,
                      };
                      setActivities([...activities, newActivity]);
                      toast.success(`Added "${name}" to activities list`);
                    // Clear the inputs and reset color preview
                    nameInput.value = "";
                    colorInput.value = "#6366f1";
                    const colorPreview = document.getElementById(
                      "colorPreview"
                    ) as HTMLElement | null;
                    const colorValue = document.getElementById(
                      "colorValue"
                    ) as HTMLElement | null;
                    const colorLabel = document.getElementById(
                      "colorLabelPreview"
                    ) as HTMLElement | null;
                    if (colorPreview) {
                      colorPreview.style.backgroundColor = "#6366f1";
                      colorPreview.style.boxShadow =
                        "0 0 15px rgba(99, 102, 241, 0.4)";
                    }
                    if (colorValue) {
                      colorValue.textContent = "#6366F1";
                    }
                    if (colorLabel) {
                      colorLabel.style.backgroundColor = "#6366f1";
                      colorLabel.style.boxShadow =
                        "0 0 15px rgba(99, 102, 241, 0.4)";
                    }
                  }
                }
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
                  key={act.id}
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
                    onClick={() => showDeleteConfirm(act)}
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
