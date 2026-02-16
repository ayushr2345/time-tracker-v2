import { useState, useMemo, useCallback } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import {
  Coffee,
  Hammer,
  Zap,
  Flame,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { APP_CONFIG } from "../../constants";
import { useActivities } from "../data/useActivities";
import { useActivityLog } from "../data/useActivityLog";
import { useConfirm } from "../ui/useConfirmToast";
import type { ActivityLogsWithDetails } from "@time-tracker/shared";

// --- Utility Functions (Pure) ---

/**
 * Formats a date string or object into a readable string.
 * Format: "Jan 1, 24, 10:00"
 */
const formatDate = (dateInput: Date | string) => {
  if (!dateInput) return "Now";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

/**
 * Determines the "Tier" (intensity level) based on duration.
 * @param secs - Duration in seconds.
 * @returns Object containing the icon, color class, and label.
 */
const getTier = (
  secs: number,
): { icon: LucideIcon; color: string; label: string } => {
  if (secs >= 36000)
    // 10 hours
    return { icon: Trophy, color: "text-yellow-400", label: "GOD TIER" };
  if (secs >= 14400)
    // 4 hours
    return { icon: Flame, color: "text-orange-500", label: "ON FIRE" };
  if (secs >= 7200)
    // 2 hours
    return { icon: Zap, color: "text-cyan-400", label: "IN THE ZONE" };
  if (secs >= 3600)
    // 1 hour
    return { icon: Hammer, color: "text-emerald-400", label: "FOCUSED" };
  return { icon: Coffee, color: "text-gray-400", label: "WARMUP" };
};

/**
 * Custom hook for managing the Activity Logs list view.
 * @remarks
 * Handles filtering, pagination, grouping, and deletion of activity logs.
 *
 * @returns An object containing:
 * - `filteredLogs`: The full list of logs after applying filters.
 * - `currentLogs`: The slice of logs for the current page.
 * - `groupedLogs`: The current page's logs grouped by activity name (if enabled).
 * - `totalPages`: Total number of pages based on filter results.
 * - `currentPage` / `setCurrentPage`: Pagination control.
 * - `goToPage`: Safe pagination handler.
 * - `handleDelete`: Function to delete a log with confirmation.
 * - Filter states (`filterActivityId`, `dateFilterType`, `startDate`, `endDate`).
 * - Helpers (`formatDate`, `getTier`).
 */
export const useActivityLogs = () => {
  const { activities } = useActivities();
  const { activityLogs, deleteLogEntry } = useActivityLog();
  const { confirm } = useConfirm();

  const itemsPerPage = APP_CONFIG.ACTIVITY_LOGS_PER_PAGE || 10;

  // State: Filters & Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [filterActivityId, setFilterActivityId] = useState("ALL");
  const [dateFilterType, setDateFilterType] = useState<
    "ALL" | "WEEK" | "CUSTOM"
  >("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [groupByActivity, setGroupByActivity] = useState(false);

  /**
   * Handles deletion of an activity log entry.
   * Prompts for confirmation before calling the API.
   */
  const handleDelete = useCallback(
    async (activityLogId: string) => {
      if (!activityLogId) {
        toast.error("Invalid Activity Log ID");
        return;
      }

      const logToDelete = activityLogs.find((a) => a._id === activityLogId);
      if (!logToDelete) {
        toast.error("Activity log not found");
        return;
      }

      const activityName = logToDelete.activityName || "Unknown Activity";
      const startStr = formatDate(logToDelete.startTime);
      const endStr = formatDate(logToDelete.endTime || new Date());

      confirm({
        title: `Delete Log for ${activityName}?`,
        message: `Are you sure you want to delete the entry from ${startStr} to ${endStr}? This cannot be undone.`,
        type: "DANGER",
        confirmText: "Yes, delete log",
        onConfirm: async () => {
          await deleteLogEntry(activityLogId);
          // Optional: Reset to page 1 if deleting the last item on a page
          if (currentLogs.length === 1 && currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
          }
        },
        onCancel: () => {},
      });
    },
    [activityLogs, confirm, deleteLogEntry],
  ); // Added dependencies

  // --- FILTERING LOGIC ---
  const filteredLogs = useMemo(() => {
    // 1. Base Filter: Only completed logs
    let result = activityLogs.filter((log) => log.status === "completed");

    // 2. Activity Filter
    if (filterActivityId !== "ALL") {
      result = result.filter((log) => log.activityId === filterActivityId);
    }

    // 3. Date Filter
    if (dateFilterType === "WEEK") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      result = result.filter((log) => new Date(log.startTime) >= oneWeekAgo);
    } else if (dateFilterType === "CUSTOM" && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the entire end day
      result = result.filter((log) => {
        const logDate = new Date(log.startTime);
        return logDate >= start && logDate <= end;
      });
    }

    // 4. Sorting: Newest first
    return result.sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    );
  }, [activityLogs, filterActivityId, dateFilterType, startDate, endDate]);

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  // Calculate specific logs for current page
  const currentLogs = useMemo(() => {
    // Reset to page 1 if filters reduce results below current page
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage, totalPages]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // --- GROUPING LOGIC ---
  // Note: We group the *current page* of logs, not the entire dataset.
  // This maintains pagination performance while showing grouped views.
  const groupedLogs = useMemo(() => {
    if (!groupByActivity) return null;

    return currentLogs.reduce(
      (acc, log) => {
        // Fallback name logic if activityLog doesn't have the name populated
        const matchedActivity = activities.find(
          (a) => a._id === log.activityId,
        );
        const name = log.activityName || matchedActivity?.name || "Unknown";

        if (!acc[name]) acc[name] = [];
        acc[name].push(log);
        return acc;
      },
      {} as Record<string, ActivityLogsWithDetails[]>,
    );
  }, [currentLogs, groupByActivity, activities]);

  const handleClearFilters = () => {
    setFilterActivityId("ALL");
    setDateFilterType("ALL");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const handleWeekFilterToggle = () => {
    if (dateFilterType === "WEEK") {
      setDateFilterType("ALL");
    } else {
      setDateFilterType("WEEK");
    }
    setCurrentPage(1);
  };

  return {
    // Data
    filteredLogs,
    currentLogs,
    groupedLogs,

    // Pagination
    currentPage,
    totalPages,
    setCurrentPage,
    goToPage,

    // Filters (State & Setters)
    filterActivityId,
    setFilterActivityId,
    dateFilterType,
    setDateFilterType,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    groupByActivity,
    setGroupByActivity,

    // Actions & Helpers
    handleDelete,
    formatDate,
    getTier,
    handleClearFilters,
    handleWeekFilterToggle,
  };
};
