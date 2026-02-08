import { useState } from "react";
import { toast } from "react-toastify";
import { useActivities } from "../data/useActivities";
import { useActivityLog } from "../data/useActivityLog";
import type { ActivityLogEntry } from "../../types/activityLog";
import { APP_CONFIG } from "../../constants";

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
   * Formats seconds into a human-readable time string (hours and minutes).
   * @param seconds   - Total seconds to format
   * @returns string  - Formatted time string like "2h 30m"
   */
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  /**
   * Sums activity logs by a specified time period.
   * @param logs      - Array of activity logs to sum
   * @param period    - Time period to filter by (today, week, month, lastMonth, year, prevYear)
   * @returns number  - Total duration in seconds for the specified period
   */
  const sumLogsByPeriod = (
    logs: ActivityLogEntry[],
    period: "today" | "week" | "month" | "lastMonth" | "year" | "prevYear",
  ) => {
    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = day === 0 ? 6 : day - 1; // Treat Monday as start
    startOfWeek.setDate(startOfWeek.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999,
    );
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    return logs.reduce((total, log) => {
      if (log.status === "completed" && log.endTime) {
        const start = new Date(log.startTime);
        const end = new Date(log.endTime);
        const duration = end ? (end.getTime() - start.getTime()) / 1000 : 0; // seconds

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
            if (start < startOfYear) return total + duration;
            break;
        }
      }
      return total;
    }, 0);
  };

  // Calculate data for charts
  const chartData = activities.map((activity, index) => {
    const logsForActivity = activityLogs.filter(
      (log) => log.activityId === activity._id,
    );
    const total = sumLogsByPeriod(logsForActivity, "week");
    return {
      name: activity.name,
      time: parseFloat((total / 3600).toFixed(2)), // convert to hours
      color: activity.color || chartColors[index % chartColors.length],
    };
  });

  const isChartDataEmpty = (
    chartData: Array<{ name: string; time: number; color: string }>,
  ) => {
    return !chartData.some((data) => data.time !== 0);
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
