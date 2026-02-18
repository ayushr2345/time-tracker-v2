import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import type {
  Activity,
  ActivityWithLogCount,
  CreateActivityPayload,
  UpdateActivityPayload,
} from "@time-tracker/shared";
import { useActivities } from "../data/useActivities";
import { useConfirm } from "../ui/useConfirmToast";
import { APP_LIMITS } from "@time-tracker/shared";

/**
 * Custom hook for managing the activities form logic.
 * @remarks
 * Handles form state, activity creation, updates, and deletion with confirmation dialogs.
 * Manages color selection and preset colors for new and existing activities.
 *
 * @returns An object containing:
 * - `activities`: Array of all activities.
 * - `loading`: Loading state from the data source.
 * - `name` / `setName`: State for the activity name input.
 * - `selectedColor` / `setSelectedColor`: State for the color picker.
 * - `presetColors`: Array of available color options.
 * - `editingId`: The ID of the activity currently being edited (null if creating).
 * - `handleSubmit`: Function to handle form submission (Create or Update).
 * - `handleDeleteActivity`: Function to delete an activity with confirmation.
 * - `startEditing`: Function to populate the form with an existing activity's data.
 * - `cancelEditing`: Function to reset the form and exit edit mode.
 */
export const useActivitiesForm = () => {
  const { activities, loading, addActivity, deleteActivity, updateActivity } =
    useActivities();
  const { confirm } = useConfirm();
  const [name, setName] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>(
    APP_LIMITS.DEFAULT_ACTIVITY_COLOR,
  );
  const [editingId, setEditingId] = useState<string | null>(null);

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
   * Resets the form to its default state.
   */
  const resetForm = () => {
    setName("");
    setSelectedColor(APP_LIMITS.DEFAULT_ACTIVITY_COLOR);
    setEditingId(null);
  };

  /**
   * Internal handler for creating a new activity.
   */
  const createNewActivity = async () => {
    const activityPayload: CreateActivityPayload = {
      name: name.trim(),
      color: selectedColor,
    };
    const success = await addActivity(activityPayload);
    if (success) {
      resetForm();
    }
  };

  /**
   * Internal handler for updating an existing activity.
   */
  const updateExistingActivity = async () => {
    if (!editingId) return;

    const updatedActivity: UpdateActivityPayload = {
      name: name.trim(),
      color: selectedColor,
    };

    const success = await updateActivity(editingId, updatedActivity);
    if (success) {
      resetForm();
    }
  };

  /**
   * Handles form submission.
   * Routes to either create or update logic based on `editingId`.
   */
  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Activity name cannot be empty.");
      return;
    }

    if (editingId) {
      await updateExistingActivity();
    } else {
      await createNewActivity();
    }
  };

  /**
   * Populates the form with data from an existing activity to enable editing mode.
   * Scrolls the window to the form area for better UX.
   *
   * @param activity - The activity object to edit.
   */
  const startEditing = (activity: Activity | ActivityWithLogCount) => {
    setEditingId(activity._id);
    setName(activity.name);
    setSelectedColor(activity.color);
    // Smooth scroll to the form input (adjust 'top' value based on your UI layout)
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  /**
   * Cancels the editing process and clears the form.
   */
  const cancelEditing = () => {
    resetForm();
  };

  /**
   * Handles activity deletion with a confirmation dialog.
   * If the activity has logs, it requires the user to type the name to confirm.
   *
   * @param act - The activity object to delete.
   */
  const handleDeleteActivity = async (act: ActivityWithLogCount) => {
    const isDangerous = act.logCount > 0;

    confirm({
      title: `Delete "${act.name}"?`,
      message: isDangerous
        ? "This activity has recorded logs. This action cannot be undone."
        : "This action cannot be undone.",
      type: "DANGER",
      requireInput: isDangerous,
      matchText: isDangerous ? act.name : "",
      confirmText: "Delete",
      onConfirm: async () => {
        await deleteActivity(act._id);
        // If we deleted the activity currently being edited, reset the form
        if (editingId === act._id) {
          resetForm();
        }
      },
      onCancel: () => {},
    });
  };

  return {
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
  };
};
