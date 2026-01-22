import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useActivities } from "../data/useActivities";
import type { Activity } from "../../types/activity";
import { useConfirm } from "../ui/useConfirmToast";

export const useActivitiesForm = () => {
  const { activities, loading, addActivity, deleteActivity } = useActivities();
  const { confirm } = useConfirm();
  const [name, setName] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("#6366f1");

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
      setSelectedColor("#6366f1");
    }
    return success;
  };

  const handleDeleteActivity = async (act: Activity) => {
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
