import { useMemo } from "react";
import type { ActivityLogsWithDetails } from "../../types/activityLog";
import { formatDate, getTier } from "../../utils";

export interface DayData {
  date: string;
  value: number;
  intensity: number;
}

// --- Pure Utility Functions (Moved outside hook for performance) ---

/**
 * Calculates the heat intensity (0-4) based on duration in seconds.
 * 0 = No activity
 * 1 = < 1 hour
 * 2 = 1-3 hours
 * 3 = 3-6 hours
 * 4 = 6+ hours
 */
const getIntensity = (seconds: number): number => {
  if (seconds === 0) return 0;
  const hours = seconds / 3600;
  if (hours < 1) return 1;
  if (hours < 3) return 2;
  if (hours < 6) return 3;
  return 4;
};

/**
 * Returns the Tailwind CSS classes for a specific intensity level.
 */
const getColor = (intensity: number): string => {
  switch (intensity) {
    case 0:
      return "bg-white/5 border-transparent";
    case 1:
      return "bg-indigo-900/40 border-indigo-500/20";
    case 2:
      return "bg-indigo-700/60 border-indigo-500/40";
    case 3:
      return "bg-indigo-500 border-indigo-400/50";
    case 4:
      return "bg-cyan-400 border-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.5)]";
    default:
      return "bg-white/5";
  }
};

/**
 * Custom hook for generating Activity Heatmap data.
 * @remarks
 * Processes activity logs to generate a 365-day contribution graph (GitHub style).
 * Aligning data into weeks (columns) and days (rows).
 *
 * @param logs - Array of activity logs to process.
 * @returns Object containing:
 * - `weeks`: A 2D array of DayData (Array of Weeks).
 * - Helper functions for styling and formatting.
 */
export const useActivityHeatMap = (logs: ActivityLogsWithDetails[]) => {
  /**
   * Memoized grid generation logic.
   * Only recalculates when the raw logs change.
   */
  const weeks = useMemo<DayData[][]>(() => {
    // 1. Aggregate durations by date (YYYY-MM-DD)
    const durationMap = new Map<string, number>();

    logs.forEach((log) => {
      // Only count completed logs with valid start times
      if (log.status === "completed" && log.startTime) {
        // Use 'en-CA' (YYYY-MM-DD) for consistent local date keys
        const dateKey = new Date(log.startTime).toLocaleDateString("en-CA");
        const currentTotal = durationMap.get(dateKey) || 0;
        durationMap.set(dateKey, currentTotal + (log.duration || 0));
      }
    });

    // 2. Calculate Grid Boundaries
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364); // Go back roughly 1 year

    // 3. Align Start Date to the previous Sunday (Start of Week)
    // This ensures the graph columns always start on a Sunday.
    const dayOfWeek = startDate.getDay(); // 0 = Sunday
    startDate.setDate(startDate.getDate() - dayOfWeek);

    // 4. Generate the Grid
    const groupedWeeks: DayData[][] = [];
    const currentDateIterator = new Date(startDate);
    const end = new Date(today);

    // Ensure we cover enough days to fill the grid up to today
    // We iterate until we pass 'today'
    while (currentDateIterator <= end || groupedWeeks.length === 0) {
      const week: DayData[] = [];

      // Generate 7 days for this week
      for (let i = 0; i < 7; i++) {
        const dateKey = currentDateIterator.toLocaleDateString("en-CA");
        const duration = durationMap.get(dateKey) || 0;

        week.push({
          date: dateKey,
          value: duration,
          intensity: getIntensity(duration),
        });

        // Advance one day
        currentDateIterator.setDate(currentDateIterator.getDate() + 1);
      }

      groupedWeeks.push(week);

      // Safety break to prevent infinite loops in edge cases
      if (currentDateIterator > end) break;
    }

    return groupedWeeks;
  }, [logs]);

  return {
    weeks,
    getColor,
    getTier,
    formatDate,
  };
};
