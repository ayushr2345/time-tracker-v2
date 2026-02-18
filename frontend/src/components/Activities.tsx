import type { JSX } from "react";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useActivitiesForm } from "../hooks/logic/useActivitiesForm";
import { APP_LIMITS } from "@time-tracker/shared";
import LoadingSpinner from "./LoadingSpinner";
import { Target, Plus, Palette, Edit2, Save, X } from "lucide-react";
import ActivityItemForActivities from "./ActivityItemForActivities";

/**
 * The main container for managing activities.
 * @remarks
 * Renders a form to create/edit activities and a list of existing activities.
 * Handles loading states and toast notifications.
 *
 * @returns The rendered Activities management page.
 */
function Activities(): JSX.Element {
  const {
    activities,
    loading,
    name,
    setName,
    selectedColor,
    setSelectedColor,
    presetColors,
    handleDeleteActivity,
    editingId,
    startEditing,
    cancelEditing,
    handleSubmit,
  } = useActivitiesForm();

  // Loading State
  if (loading && activities.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 mt-6 max-w-3xl mx-auto px-4 sm:px-0">
      {/* 1. Header Section */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl sm:text-4xl font-bold text-white flex items-center justify-center gap-3">
          <Target className="w-8 h-8 text-blue-400" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            Activities
          </span>
        </h2>
        <p className="text-gray-400 text-base font-medium">
          Manage and customize the activities you track.
        </p>
      </div>

      {/* 2. Form Card (Create / Edit Mode) */}
      <div
        className={`
          relative overflow-hidden rounded-3xl p-6 sm:p-8 shadow-2xl border transition-all duration-500
          ${
            editingId
              ? "bg-indigo-900/20 border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.1)]"
              : "bg-gray-900/40 border-white/5 backdrop-blur-md"
          }
        `}
      >
        {/* Card Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            {editingId ? (
              <Edit2 className="w-5 h-5 text-indigo-400" />
            ) : (
              <Plus className="w-5 h-5 text-emerald-400" />
            )}
            <span>{editingId ? "Edit Activity" : "Add New Activity"}</span>
          </h3>

          {editingId && (
            <button
              onClick={cancelEditing}
              className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              <X className="w-3 h-3" /> Cancel
            </button>
          )}
        </div>

        {/* Form Content */}
        <div className="flex flex-col gap-6">
          {/* Activity Name Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
              Activity Name
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Coding, Reading, Workout..."
                value={name}
                maxLength={APP_LIMITS.MAX_ACTIVITY_NAME_LENGTH}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-3.5 rounded-xl bg-gray-950/50 border border-white/10 text-white placeholder:text-gray-600 focus:bg-gray-900 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
              <div className="absolute right-3 bottom-3 text-[10px] text-gray-600 font-mono">
                {name.length}/{APP_LIMITS.MAX_ACTIVITY_NAME_LENGTH}
              </div>
            </div>
          </div>

          {/* Color Picker Section */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 ml-1">
              <Palette className="w-4 h-4" />
              Color Theme
            </label>

            <div className="bg-gray-950/30 rounded-xl p-4 border border-white/5 flex flex-wrap gap-3 items-center">
              {/* Preset Colors */}
              {presetColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`
                    w-8 h-8 rounded-full border-2 transition-all hover:scale-110 active:scale-95
                    ${selectedColor === color.value ? "border-white scale-110 shadow-lg ring-2 ring-white/20" : "border-transparent hover:border-white/30"}
                  `}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                  aria-label={`Select color ${color.name}`}
                />
              ))}

              {/* Divider */}
              <div className="w-px h-8 bg-white/10 mx-1" />

              {/* Custom Color Input */}
              <div className="relative group w-8 h-8 rounded-full overflow-hidden border-2 border-white/10 hover:border-white/30 transition-all">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-0"
                  title="Custom Color"
                />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/10 group-hover:bg-transparent">
                  <Plus className="w-3 h-3 text-white/50" />
                </div>
              </div>
            </div>

            {/* Live Preview Bar */}
            <div
              className="h-1.5 w-full rounded-full mt-2 transition-all duration-500 opacity-80"
              style={{
                background: `linear-gradient(to right, ${selectedColor}00, ${selectedColor}, ${selectedColor}00)`,
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            className={`
              w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2
              ${
                editingId
                  ? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20"
                  : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/20"
              }
            `}
          >
            {editingId ? (
              <Save className="w-5 h-5" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            <span>{editingId ? "Save Changes" : "Create Activity"}</span>
          </button>
        </div>
      </div>

      {/* 3. Activity List Section */}
      <div className="space-y-4 pb-12">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-bold text-gray-200 flex items-center gap-2">
            <span>Library</span>
            <span className="text-sm font-normal text-gray-500 bg-gray-900 px-2 py-0.5 rounded-full border border-gray-800">
              {activities.length}
            </span>
          </h3>
        </div>

        {activities.length === 0 ? (
          <div className="rounded-xl p-12 text-center border border-dashed border-white/10 bg-white/5 flex flex-col items-center gap-4">
            <div className="p-4 bg-gray-900 rounded-full">
              <Target className="w-8 h-8 text-gray-500" />
            </div>
            <div className="space-y-1">
              <p className="text-gray-300 font-medium">No activities yet</p>
              <p className="text-sm text-gray-500">
                Create your first activity above to get started.
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {activities.map((act) => (
              <ActivityItemForActivities
                key={act._id}
                activity={act}
                onEdit={startEditing}
                onDelete={handleDeleteActivity}
              />
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
        toastClassName="!bg-gray-900 !border !border-gray-800 !text-white !rounded-xl !shadow-2xl"
      />
    </div>
  );
}

export default Activities;
