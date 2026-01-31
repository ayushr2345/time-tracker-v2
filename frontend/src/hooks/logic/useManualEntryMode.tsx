import { useState } from "react";
import { toast } from "react-toastify";
import { useActivities } from "../data/useActivities";
import { useConfirm } from "../ui/useConfirmToast";
import type { ConfirmToastType } from "../../components/ConfirmToast";
import { useActivityLog } from "../data/useActivityLog";

export const useManualEntryMode = () => {
  const { createManualLogEntry } = useActivityLog();
  const { activities, loading } = useActivities();
  const { confirm } = useConfirm();

  const [selectedActivityId, setSelectedActivityId] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("today");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  const handleChangeDay = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDay(e.target.value);
  };

  const handleChangeActivity = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedActivityId(e.target.value);
  };

  const getParsedData = () => {
    if (!selectedActivityId) {
      toast.error("Please select an activity to save the manual entry.");
      return null;
    }
    if (!startTime || !endTime) {
      toast.error("Please provide both start and end times.");
      return null;
    }

    const startTimeDate = new Date();
    console.log("starttime", startTime);
    console.log(endTime);
    startTimeDate.setHours(parseInt(startTime.split(":")[0], 10));
    startTimeDate.setMinutes(parseInt(startTime.split(":")[1], 10));
    startTimeDate.setSeconds(0, 0);

    const endTimeDate = new Date();
    endTimeDate.setHours(parseInt(endTime.split(":")[0], 10));
    endTimeDate.setMinutes(parseInt(endTime.split(":")[1], 10));
    endTimeDate.setSeconds(0, 0);

    if (selectedDay === "yesterday") {
      startTimeDate.setDate(startTimeDate.getDate() - 1);
      endTimeDate.setDate(endTimeDate.getDate() - 1);
    }

    const currentTime = new Date();
    if (startTimeDate > currentTime) {
      toast.error("Start time cannot be in the future.");
      return null;
    }
    if (endTimeDate > currentTime) {
      toast.error("End time cannot be in the future.");
      return null;
    }
    if (startTimeDate >= endTimeDate) {
      toast.error("End time must be after start time.");
      return null;
    }

    const fiveMinutes = 5 * 60 * 1000;
    const twelveHours = 12 * 60 * 60 * 1000;
    const twentyFourHours = 24 * 60 * 60 * 1000;

    const duration = endTimeDate.getTime() - startTimeDate.getTime();
    var message = `The duration you entered is ${duration / (1000 * 60)} mins. Are you sure you want to add this entry to "${activities.find((a) => a._id == selectedActivityId)?.name}"?`;
    var toastType: ConfirmToastType = "INFO";
    if (duration < fiveMinutes) {
      toast.error("At least 5 minutes of activity duration is required.");
      return false;
    }
    if (duration > twelveHours) {
      toast.warning("Logging high duration. Please confirm");
      message = `The duration you entered is  hours, which exceeds the recommended maximum of 12 hours. Are you sure you want to add this entry to "${activities.find((a) => a._id === selectedActivityId)?.name}"?`;
      toastType = "WARNING";
    }
    if (duration > twentyFourHours) {
      toast.error("Activity duration cannot exceed 24 hours.");
      return false;
    }

    return { startTimeDate, endTimeDate, message, toastType };
  };

  const handleSubmitManualEntry = () => {
    const data = getParsedData();
    if (!data) return;

    const { startTimeDate, endTimeDate, message, toastType } = data;
    console.log(startTimeDate, endTimeDate);

    confirm({
      title: `Confirm Manual Entry for ${activities.find((a) => a._id === selectedActivityId)?.name}`,
      message: message,
      type: toastType,
      confirmText: "Yes, Add Entry",
      onConfirm: async () => {
        const success = await createManualLogEntry(
          selectedActivityId,
          startTimeDate,
          endTimeDate,
        );
        if (success) {
          setSelectedActivityId("");
          setSelectedDay("today");
          setEndTime("");
          setStartTime("");
        }
      },
      onCancel: () => {},
    });
  };

  return {
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
  };
};
