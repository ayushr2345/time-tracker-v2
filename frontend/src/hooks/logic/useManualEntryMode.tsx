import { useState } from "react";
import { toast } from "react-toastify";
import { useActivities } from "../data/useActivities";
import { useConfirm } from "../ui/useConfirmToast";
import type { ConfirmToastType } from "../../components/ConfirmToast";
import { activityLogService } from "../../services";
import type { CreateManualEntryLog } from "../../services/activityLogService";

export const useManualEntryMode = () => {
  const { activities, loading } = useActivities();
  const { confirm } = useConfirm();

  const [selectedActivityId, setSelectedActivityId] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("today");
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");

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
    startTimeDate.setHours(parseInt(startTime.split(":")[0], 10));
    startTimeDate.setMinutes(parseInt(startTime.split(":")[1], 10));

    const endTimeDate = new Date();
    endTimeDate.setHours(parseInt(endTime.split(":")[0], 10));
    endTimeDate.setMinutes(parseInt(endTime.split(":")[1], 10));

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
    var message = `The duration you entered is ${duration/ (1000 * 60)} mins. Are you sure you want to add this entry to "${activities.find((a) => a._id == selectedActivityId)?.name}"?`;
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

  const submitManualEntry = async (
    selectedActivityId: string,
    startTimeDate: Date,
    endTimeDate: Date,
  ) => {
    try {
      const payload: CreateManualEntryLog = {
        activityId: selectedActivityId,
        startTime: startTimeDate,
        endTime: endTimeDate,
      };
      const savedActivity =
        await activityLogService.createManualEntryLog(payload);
      toast.success(
        `Saved manual entry for "${
          activities.find((a) => a._id === selectedActivityId)!.name
        }"`,
      );
      return true;
    } catch (error) {
      // if (error instanceof AxiosError) {
      //   const statusCode = error.response?.status;
      //   if (statusCode === 400) {
      //     toast.error("Invalid activity data provided.");
      //   } else if (statusCode === 409) {
      //     toast.error("An activity with this name already exists.");
      //   } else {
      //     toast.error(
      //       `Failed to create activity: ${error.response?.data?.message || error.message}`,
      //     );
      //   }
      // } else {
      //   toast.error(`Failed to create activity: ${error}`);
      // }
      console.log("Error creating activity:", error);
      return false;
    }
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
      onConfirm: () => {
        submitManualEntry(selectedActivityId, startTimeDate, endTimeDate);
        setSelectedActivityId("");
        setSelectedDay("today");
        setEndTime("17:00");
        setStartTime("17:00");
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
    setStartTime,
    setEndTime,
    handleSubmitManualEntry,
  };
};

// frontend to backend time zone not in sync, need to check
// TODO: Complete Manual Entry frontend to backend submission with AxiosErrors and status code checks
