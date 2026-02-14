import { useState, useMemo } from "react";
import "react-toastify/dist/ReactToastify.css";
import { APP_CONFIG } from "../../constants";
import { useActivities } from "../data/useActivities";
import { useActivityLog } from "../data/useActivityLog";
import { Coffee, Hammer, Zap, Flame, Trophy } from "lucide-react";
import { useConfirm } from "../ui/useConfirmToast";
import { toast } from "react-toastify";

export const useActivityLogs = () => {
  const { activities } = useActivities();
  const { activityLogs, deleteLogEntry } = useActivityLog();
  const { confirm } = useConfirm();

  const itemsPerPage = APP_CONFIG.ACTIVITY_LOGS_PER_PAGE;
  const [currentPage, setCurrentPage] = useState(1);
  const [filterActivityId, setFilterActivityId] = useState("ALL");
  const [dateFilterType, setDateFilterType] = useState("ALL"); // 'ALL', 'WEEK', 'CUSTOM'
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [groupByActivity, setGroupByActivity] = useState(false);

  const handleDelete = async (activityLogId: string) => {
    if (activityLogId) {
      const activityLog = activityLogs.find((a) => a._id === activityLogId);
      if (activityLog) {
        const activityName = activityLog.activityName || "Unknown Activity";
        const activityStartTime = activityLog.startTime || new Date();
        const activityEndTime = activityLog.endTime || new Date();
        confirm({
          title: `Confirm delete activity log entry for ${activityName}`,
          message: `Are you sure you want to delete the log ${formatDate(activityStartTime)} - ${formatDate(activityEndTime)} for ${activityName}`,
          type: "DANGER",
          confirmText: "Yes, delete log",
          onConfirm: async () => {
            await deleteLogEntry(activityLogId);
          },
          onCancel: () => {},
        });
      }
    } else {
      toast.error("Activity Log ID is empty");
    }
  };

  // --- FILTERING LOGIC ---
  const filteredLogs = useMemo(() => {
    let result = activityLogs.filter((log) => log.status === "completed");

    // 1. Activity Filter
    if (filterActivityId !== "ALL") {
      result = result.filter((log) => log.activityId === filterActivityId);
    }

    // 2. Date Filter
    if (dateFilterType === "WEEK") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      result = result.filter((log) => new Date(log.startTime) >= oneWeekAgo);
    } else if (dateFilterType === "CUSTOM" && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the whole end day
      result = result.filter((log) => {
        const logDate = new Date(log.startTime);
        return logDate >= start && logDate <= end;
      });
    }

    // 3. Sorting (Ensure newest first)
    return result.sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    );
  }, [activityLogs, filterActivityId, dateFilterType, startDate, endDate]);

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  // Calculate specific logs for current page
  const currentLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage]);

  // Handle Page Change
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // --- GROUPING LOGIC ---
  // We group whatever is on the CURRENT PAGE to allow pagination to still work
  const groupedLogs = useMemo(() => {
    if (!groupByActivity) return null;

    return currentLogs.reduce(
      (acc, log) => {
        const act = activities.find((a) => a._id === log.activityId);
        const name = log.activityName || act?.name || "Unknown";

        if (!acc[name]) acc[name] = [];
        acc[name].push(log);
        return acc;
      },
      {} as Record<string, typeof currentLogs>,
    );
  }, [currentLogs, groupByActivity, activities]);

  const formatDate = (dateString: Date) => {
    if (!dateString) return "Now";
    return new Date(dateString).toLocaleString([], {
      month: "short",
      day: "numeric",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getTier = (secs: number) => {
    if (secs >= 36000)
      return { icon: Trophy, color: "text-yellow-400", label: "GOD TIER" };
    if (secs >= 14400)
      return { icon: Flame, color: "text-orange-500", label: "ON FIRE" };
    if (secs >= 7200)
      return { icon: Zap, color: "text-cyan-400", label: "IN THE ZONE" };
    if (secs >= 3600)
      return { icon: Hammer, color: "text-emerald-400", label: "FOCUSED" };
    return { icon: Coffee, color: "text-gray-400", label: "WARMUP" };
  };

  return {
    setFilterActivityId,
    setDateFilterType,
    setStartDate,
    setEndDate,
    setGroupByActivity,
    handleDelete,
    goToPage,
    groupedLogs,
    filteredLogs,
    filterActivityId,
    dateFilterType,
    currentLogs,
    setCurrentPage,
    groupByActivity,
    startDate,
    currentPage,
    totalPages,
    formatDate,
    getTier,
  };
};
