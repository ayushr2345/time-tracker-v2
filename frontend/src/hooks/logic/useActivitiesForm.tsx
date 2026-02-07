import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useActivities } from "../data/useActivities";
import type { Activity, ActivityWithLogCount } from "../../types/activity";
import { useConfirm } from "../ui/useConfirmToast";
import { APP_CONFIG } from "../../constants";

/**
 * Custom hook for managing the activities form logic.
 * @remarks
 * Handles form state, activity creation, and deletion with confirmation dialogs.
 * Manages color selection and preset colors for new activities.
 * @returns Object containing form state and handlers
 * @returns activities             - Array of all activities
 * @returns loading                - Loading state
 * @returns name                   - Activity name input value
 * @returns setName                - Function to update activity name
 * @returns selectedColor          - Currently selected color
 * @returns setSelectedColor       - Function to update selected color
 * @returns presetColors           - Array of preset color options
 * @returns handleCreateActivity   - Function to create a new activity
 * @returns handleDeleteActivity   - Function to delete an activity
 */
export const useActivitiesForm = () => {
  const { activities, loading, addActivity, deleteActivity } = useActivities();
  const { confirm } = useConfirm();
  const [name, setName] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>(
    APP_CONFIG.DEFAULT_ACTIVITY_COLOR,
  );

  const presetColors = [
    { name: "Blue", value: "#3b82f6" },
    { name: "Purple", value: "#8b5cf6" },
    { name: "Pink", value: "#ec4899" },
    { name: "Emerald", value: "#10b981" },
    { name: "Amber", value: "#f59e0b" },
    { name: "Cyan", value: "#06b6d4" },
    { name: "Orange", value: "#f97316" },
    { name: "Violet", value: "#a855f7" },
  ];

  /**
   * Handles activity creation with validation and form reset.
   * @returns boolean             - True if activity was created successfully, false otherwise
   */
  const handleCreateActivity = async () => {
    if (!name.trim()) {
      toast.error("Activity name cannot be empty.");
      return false;
    }
    const success = await addActivity({
      name: name.trim(),
      color: selectedColor,
    });
    if (success) {
      setName("");
      setSelectedColor(APP_CONFIG.DEFAULT_ACTIVITY_COLOR);
    }
    return success;
  };

  /**
   * Handles activity deletion with confirmation dialog requiring user input.
   * @param act                    - The activity object to delete
   */
  const handleDeleteActivity = async (act: ActivityWithLogCount) => {
    if (act.logCount > 0) {
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
    } else {
      confirm({
        title: `Delete "${act.name}"?`,
        message: "This action cannot be undone.",
        type: "DANGER",
        requireInput: false,
        matchText: "",
        confirmText: "Delete",
        onConfirm: async () => {
          await deleteActivity(act._id);
        },
        onCancel: () => {},
      });
    }
  };

  return {
    activities,
    loading,
    name,
    setName,
    selectedColor,
    setSelectedColor,
    presetColors,
    handleCreateActivity,
    handleDeleteActivity,
  };
};

// TODO: add frontend and supporting backend to update activity name
