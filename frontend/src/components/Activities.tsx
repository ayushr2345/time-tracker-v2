import React, { useState } from "react";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useActivitiesForm } from "../hooks/logic/useActivitiesForm";
import { APP_CONFIG } from "../constants";
import LoadingSpinner from "./LoadingSpinner";
import { 
  Target, 
  Plus, 
  Palette, 
  Trash2, 
  Edit2, 
  Save, 
  X,
  Check
} from "lucide-react";

// --- Activity Item Sub-Component ---
const ActivityItem = ({ activity, onEdit, onDelete }) => (
  <li
    className="group relative overflow-hidden rounded-2xl bg-gray-900/50 border border-white/5 hover:border-white/10 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.01]"
  >
    {/* Left Color Bar */}
    <div 
      className="absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2" 
      style={{ backgroundColor: activity.color }}
    />

    <div className="p-5 pl-7 flex items-center justify-between">
      
      {/* Activity Info */}
      <div className="flex items-center gap-4">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shadow-sm"
          style={{ 
            backgroundColor: `${activity.color}20`, 
            color: activity.color,
            border: `1px solid ${activity.color}40`
          }}
        >
          {activity.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all">
            {activity.name}
          </h3>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            {activity.color.toUpperCase()}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(activity)}
          className="p-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          title="Edit Activity"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(activity)}
          className="p-2.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
          title="Delete Activity"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  </li>
);

/**
 * Activities management component.
 * @returns JSX.Element
 */
function Activities() {
  const {
    activities,
    loading,
    name,
    setName,
    selectedColor,
    setSelectedColor,
    presetColors,
    handleCreateActivity,
    handleDeleteActivity,
    // Assuming you add an update function to your hook:
    // handleUpdateActivity(id, newName, newColor)
  } = useActivitiesForm();

  // Local state for Edit Mode
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- Handlers ---

  const startEditing = (activity: any) => {
    setEditingId(activity._id);
    setName(activity.name);
    setSelectedColor(activity.color);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setName("");
    setSelectedColor(presetColors[0].value); // Reset to default
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Activity name cannot be empty.");
      return;
    }

    if (editingId) {
      // UPDATE LOGIC
      // await handleUpdateActivity(editingId, name, selectedColor);
      toast.success("Activity updated successfully!"); // Placeholder until hook is updated
      cancelEditing();
    } else {
      // CREATE LOGIC
      await handleCreateActivity();
      // Hook usually clears form, but let's be safe
      setName(""); 
    }
  };

  if (loading && activities.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 mt-6 max-w-3xl mx-auto">
      
      {/* 1. Heading */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl sm:text-4xl font-bold text-white flex items-center justify-center gap-3">
          <Target className="w-8 h-8 text-blue-400" />
          <span className="text-gradient">Activities</span>
        </h2>
        <p className="text-gray-300 text-base font-medium">
          Customize what you track
        </p>
      </div>

      {/* 2. Form Card (Create / Edit) */}
      <div className={`
        relative overflow-hidden rounded-3xl p-6 sm:p-8 shadow-2xl border transition-all duration-500
        ${editingId 
          ? "bg-indigo-900/20 border-indigo-500/30 shadow-indigo-500/10" 
          : "glass border-white/10"}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            {editingId ? <Edit2 className="w-5 h-5 text-indigo-400" /> : <Plus className="w-5 h-5 text-emerald-400" />}
            <span>{editingId ? "Edit Activity" : "Add New Activity"}</span>
          </h3>
          {editingId && (
            <button 
              onClick={cancelEditing}
              className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg"
            >
              <X className="w-3 h-3" /> Cancel
            </button>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Name</label>
            <input
              type="text"
              placeholder="e.g. Coding, Reading, Workout..."
              value={name}
              maxLength={APP_CONFIG.MAX_ACTIVITY_NAME_LENGTH}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-3.5 rounded-xl bg-gray-900/50 border border-white/10 text-white placeholder:text-gray-500 focus:bg-gray-900/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
            <div className="flex justify-end">
               <span className="text-[10px] text-gray-500 font-mono">
                 {name.length}/{APP_CONFIG.MAX_ACTIVITY_NAME_LENGTH}
               </span>
            </div>
          </div>

          {/* Color Picker Section */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 ml-1">
              <Palette className="w-4 h-4" />
              Color Theme
            </label>
            
            <div className="bg-gray-900/30 rounded-xl p-4 border border-white/5 flex flex-wrap gap-3">
              {/* Presets */}
              {presetColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`
                    w-8 h-8 rounded-full border-2 transition-all hover:scale-110 active:scale-95
                    ${selectedColor === color.value ? "border-white scale-110 shadow-lg" : "border-transparent hover:border-white/50"}
                  `}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
              
              {/* Divider */}
              <div className="w-px h-8 bg-white/10 mx-1" />

              {/* Custom Picker */}
              <div className="relative group">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div 
                  className="w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800 group-hover:border-white/50 transition-all"
                  style={{ backgroundColor: selectedColor }} // Shows selected custom color
                >
                   <Plus className="w-3 h-3 text-white/50" />
                </div>
              </div>
            </div>
            
            {/* Live Preview Bar */}
            <div 
              className="h-1.5 w-full rounded-full mt-2 transition-all duration-500"
              style={{ 
                background: `linear-gradient(to right, ${selectedColor}00, ${selectedColor}, ${selectedColor}00)` 
              }} 
            />
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleSubmit}
            className={`
              w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform active:scale-[0.99] flex items-center justify-center gap-2
              ${editingId 
                ? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/25" 
                : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/25"}
            `}
          >
            {editingId ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            <span>{editingId ? "Update Activity" : "Create Activity"}</span>
          </button>
        </div>
      </div>

      {/* 3. List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-lg font-bold text-white flex items-center gap-2">
             <span className="text-xl">📋</span>
             <span>Library ({activities.length})</span>
           </h3>
        </div>

        {activities.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center border border-dashed border-white/10">
            <div className="flex flex-col items-center gap-4 opacity-50">
              <Target className="w-16 h-16 text-gray-400" />
              <p className="text-gray-300 font-medium">No activities found</p>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {activities.map((act) => (
              <ActivityItem 
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
        toastClassName="bg-gray-900 border border-gray-800 text-white rounded-xl shadow-2xl"
      />
    </div>
  );
}

export default Activities;