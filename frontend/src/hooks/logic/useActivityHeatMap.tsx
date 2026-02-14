import { useMemo } from "react";
import { Coffee, Hammer, Zap, Flame, Trophy } from "lucide-react";
import type { ActivityLogsWithDetails } from "../../types/activityLog";

interface DayData {
  date: string;
  value: number;
  intensity: number;
}

export const useActivityHeatMap = (logs: ActivityLogsWithDetails[]) => {
  const weeks = useMemo<DayData[][]>(() => {
    const map = new Map<string, number>();

    // Aggregate durations by date
    logs.forEach((log) => {
      if (log.status === "completed" && log.startTime) {
        const dateKey = new Date(log.startTime).toLocaleDateString("en-CA");
        const current = map.get(dateKey) || 0;
        map.set(dateKey, current + (log.duration || 0));
      }
    });

    // Generate grid (approx 52 weeks)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 364); // Go back 1 year

    // Align to Sunday to ensure columns start correctly
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const end = new Date();
    let currentDate = new Date(startDate);

    // Temporary storage
    const allDays: DayData[] = [];

    while (currentDate <= end) {
      const dateKey = currentDate.toLocaleDateString("en-CA");
      const duration = map.get(dateKey) || 0;

      allDays.push({
        date: dateKey,
        value: duration,
        intensity: getIntensity(duration),
      });

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Group into weeks (Arrays of 7 days)
    const groupedWeeks: DayData[][] = [];
    let currentWeek: DayData[] = [];

    allDays.forEach((day, index) => {
      currentWeek.push(day);

      // Push week when full (7 days) or if it's the very last day
      if (currentWeek.length === 7 || index === allDays.length - 1) {
        groupedWeeks.push(currentWeek);
        currentWeek = [];
      }
    });

    return groupedWeeks;
  }, [logs]);

  function getIntensity(seconds: number): number {
    if (seconds === 0) return 0;
    const hours = seconds / 3600;
    if (hours < 1) return 1;
    if (hours < 3) return 2;
    if (hours < 6) return 3;
    return 4;
  }

  function getColor(intensity: number): string {
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
  }

  // --- HELPER: Icon & Color Logic (Gamification) ---
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

  // --- HELPER: Date Formatter ---
  const formatDate = (dateString: Date) => {
    if (!dateString) return "Now";
    return new Date(dateString).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return {
    weeks,
    getColor,
    getTier,
    formatDate,
  };
};
