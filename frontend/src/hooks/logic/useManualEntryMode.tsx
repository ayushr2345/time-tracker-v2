import { useState } from "react";
import { toast } from "react-toastify";
import { useActivities } from "../data/useActivities";
import { useActivityLog } from "../data/useActivityLog";
import { useConfirm } from "../ui/useConfirmToast";
import type { ConfirmToastType } from "../../components/ConfirmToast";
import { APP_LIMITS } from "@time-tracker/shared";
import type { CreateManualActivityLogPayload } from "@time-tracker/shared";

/**
 * Custom hook for managing manual entry mode logic.
 * @remarks
 * Handles form state, validation, and submission of manual activity entries.
 * Validates time inputs, enforces duration constraints, and handles "yesterday" logic.
 *
 * @returns An object containing:
 * - `activities`: Array of all available activities.
 * - `loading`: Loading state from data source.
 * - `selectedActivityId`: ID of the currently selected activity.
 * - `handleChangeActivity`: Handler for activity selection dropdown.
 * - `selectedDay`: Selected day ("today" or "yesterday").
 * - `handleChangeDay`: Handler for day selection dropdown.
 * - `startTime` / `setStartTime`: State for start time input.
 * - `endTime` / `setEndTime`: State for end time input.
 * - `handleSubmitManualEntry`: Function to validate and submit the entry.
 */
export const useManualEntryMode = () => {
  const { createManualLogEntry } = useActivityLog();
  const { activities, loading } = useActivities();
  const { confirm } = useConfirm();

  const [selectedActivityId, setSelectedActivityId] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("today");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  /**
   * Handles day selection change event.
   * @param e - The select element change event.
   */
  const handleChangeDay = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDay(e.target.value);
  };

  /**
   * Handles activity selection change event.
   * @param e - The select element change event.
   */
  const handleChangeActivity = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedActivityId(e.target.value);
  };

  /**
   * Helper to format duration into a readable string (e.g. "2h 30m").
   */
  const getFormattedDuration = (ms: number) => {
    const totalMinutes = Math.floor(ms / 60000);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  /**
   * Validates and parses manual entry form data.
   * @returns Object with parsed data or null if validation fails.
   */
  const validateAndParseData = () => {
    // 1. Basic Field Validation
    if (!selectedActivityId) {
      toast.error("Please select an activity to save the manual entry.");
      return null;
    }
    if (!startTime || !endTime) {
      toast.error("Please provide both start and end times.");
      return null;
    }

    // 2. Parse Time Strings (HH:MM) into Date Objects
    const startTimeDate = new Date();
    startTimeDate.setHours(parseInt(startTime.split(":")[0], 10));
    startTimeDate.setMinutes(parseInt(startTime.split(":")[1], 10));
    startTimeDate.setSeconds(0, 0);

    const endTimeDate = new Date();
    endTimeDate.setHours(parseInt(endTime.split(":")[0], 10));
    endTimeDate.setMinutes(parseInt(endTime.split(":")[1], 10));
    endTimeDate.setSeconds(0, 0);

    // 3. Handle "Yesterday" Logic
    if (selectedDay === "yesterday") {
      startTimeDate.setDate(startTimeDate.getDate() - 1);
      endTimeDate.setDate(endTimeDate.getDate() - 1);
    }

    // 4. Validate Logic (Future checks, Start < End)
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

    // 5. Duration Constraints
    const durationMs = endTimeDate.getTime() - startTimeDate.getTime();
    const durationStr = getFormattedDuration(durationMs);
    const activityName = activities.find(
      (a) => a._id === selectedActivityId,
    )?.name;

    if (durationMs < APP_LIMITS.MIN_ACTIVITY_DURATION_MS) {
      toast.error("At least 5 minutes of activity duration is required.");
      return null;
    }

    // Redundant currently. To be used when implementing multi day entry for manual entry mode.
    if (durationMs > APP_LIMITS.MAX_ACTIVITY_DURATION_MS) {
      toast.error("Activity duration cannot exceed 24 hours.");
      return null;
    }

    // 6. Prepare Confirmation Message
    let message = `The duration you entered is ${durationStr}. Are you sure you want to add this entry to "${activityName}"?`;
    let toastType: ConfirmToastType = "INFO";

    if (durationMs > APP_LIMITS.LONG_ACTIVITY_DURATION_MS) {
      const hours = (durationMs / (1000 * 60 * 60)).toFixed(1);
      toast.warning("Logging high duration. Please confirm");
      message = `The duration you entered is ${hours} hours, which is unusually long. Are you sure you want to add this entry to "${activityName}"?`;
      toastType = "WARNING";
    }

    return { startTimeDate, endTimeDate, message, toastType, activityName };
  };

  /**
   * Handles manual entry form submission with confirmation dialog.
   * Validates data -> Shows Confirm Dialog -> Calls API.
   */
  const handleSubmitManualEntry = () => {
    const data = validateAndParseData();
    if (!data) return; // Validation failed (toasts already shown)

    const { startTimeDate, endTimeDate, message, toastType, activityName } =
      data;

    const manualEntryPayload: CreateManualActivityLogPayload = {
      activityId: selectedActivityId,
      startTime: startTimeDate,
      endTime: endTimeDate,
    };

    confirm({
      title: `Confirm Entry for ${activityName}`,
      message: message,
      type: toastType,
      confirmText: "Yes, Add Entry",
      onConfirm: async () => {
        const success = await createManualLogEntry(manualEntryPayload);
        if (success) {
          // Reset Form
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
