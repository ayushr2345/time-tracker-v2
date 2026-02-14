import { useMemo } from "react";
import { useActivities } from "../data/useActivities";
import { useActivityLog } from "../data/useActivityLog";
import type { ActivityLogEntry } from "../../types/activityLog";

type TimePeriod =
  | "today"
  | "week"
  | "month"
  | "lastMonth"
  | "year"
  | "prevYear";

/**
 * Custom hook for calculating dashboard statistics and chart data.
 * @remarks
 * Aggregates activity logs to calculate total durations by time period.
 * Prepares data for visualization components (charts).
 *
 * @returns An object containing:
 * - `activities`: List of activities.
 * - `activityLogs`: List of raw logs.
 * - `chartData`: Processed array for chart libraries (name, time, color).
 * - `sumLogsByPeriod`: Helper to calculate total duration for a specific period.
 * - `formatTime`: Helper to format seconds into "XH Ym".
 * - `isChartDataEmpty`: Helper to check if there is any data to show.
 */
export const useOverview = () => {
  const { activityLogs, loading: activityLogsLoading } = useActivityLog();
  const { activities, loading: activitiesLoading } = useActivities();

  // Define beautiful modern colors for charts
  const chartColors = [
    "#8b5cf6", // purple
    "#3b82f6", // blue
    "#ec4899", // pink
    "#10b981", // emerald
    "#f59e0b", // amber
    "#06b6d4", // cyan
    "#f97316", // orange
    "#a855f7", // violet
  ];

  /**
   * Formats seconds into a human-readable time string (e.g., "2h 30m").
   * @param seconds - Total seconds to format.
   * @returns Formatted time string.
   */
  const formatTime = (seconds: number) => {
    if (!seconds) return "0h 0m";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  /**
   * Sums activity logs by a specified time period.
   * @param logs - Array of activity logs to sum.
   * @param period - Time period to filter by.
   * @returns Total duration in seconds for the specified period.
   */
  const sumLogsByPeriod = (logs: ActivityLogEntry[], period: TimePeriod) => {
    const now = new Date();

    // 1. Calculate Date Boundaries
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = day === 0 ? 6 : day - 1; // Adjust to make Monday index 0
    startOfWeek.setDate(startOfWeek.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    endOfLastMonth.setHours(23, 59, 59, 999);

    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const startOfPrevYear = new Date(now.getFullYear() - 1, 0, 1);
    const endOfPrevYear = new Date(now.getFullYear() - 1, 11, 31);
    endOfPrevYear.setHours(23, 59, 59, 999);

    // 2. Reduce Logs
    return logs.reduce((total, log) => {
      // Only count completed logs with valid timestamps
      if (log.status === "completed" && log.endTime && log.startTime) {
        const start = new Date(log.startTime);
        const end = new Date(log.endTime);
        const duration = (end.getTime() - start.getTime()) / 1000; // seconds

        // Sanity check for negative duration (shouldn't happen, but good for safety)
        if (duration < 0) return total;

        switch (period) {
          case "today":
            if (start >= startOfToday) return total + duration;
            break;
          case "week":
            if (start >= startOfWeek) return total + duration;
            break;
          case "month":
            if (start >= startOfMonth) return total + duration;
            break;
          case "lastMonth":
            if (start >= startOfLastMonth && start <= endOfLastMonth)
              return total + duration;
            break;
          case "year":
            if (start >= startOfYear) return total + duration;
            break;
          case "prevYear":
            if (start >= startOfPrevYear && start <= endOfPrevYear)
              return total + duration;
            break;
          default:
            return total;
        }
      }
      return total;
    }, 0);
  };

  /**
   * Memoized chart data calculation.
   * Prevents recalculating the entire dataset on every render unless logs change.
   */
  const chartData = useMemo(() => {
    return activities.map((activity, index) => {
      // Filter logs for this specific activity
      const logsForActivity = activityLogs.filter(
        (log) => log.activityId === activity._id,
      );

      // Calculate total duration for the current week
      const totalSeconds = sumLogsByPeriod(logsForActivity, "week");

      return {
        name: activity.name,
        time: parseFloat((totalSeconds / 3600).toFixed(2)), // Convert to hours
        color: activity.color || chartColors[index % chartColors.length],
      };
    });
  }, [activities, activityLogs]); // Only re-run if activities or logs change

  /**
   * Checks if the chart data has any non-zero values.
   */
  const isChartDataEmpty = (
    data: Array<{ name: string; time: number; color: string }>,
  ) => {
    return !data.some((item) => item.time > 0);
  };

  return {
    activities,
    activityLogs,
    activitiesLoading,
    activityLogsLoading,
    chartColors,
    formatTime,
    sumLogsByPeriod,
    chartData,
    isChartDataEmpty,
  };
};
