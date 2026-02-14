import {
  Coffee,
  Hammer,
  Zap,
  Flame,
  Trophy,
  type LucideIcon,
} from "lucide-react";

/**
 * Formats a specific date point into a short, readable string.
 * Example output: "Oct 24, 14:30"
 *
 * @param dateInput - The date to format (can be a Date object or an ISO string).
 * @returns A localized date string including month, day, hour, and minute.
 */
export const formatDate = (dateInput: Date | string) => {
  if (!dateInput) return "Now";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

/**
 * Formats a duration in seconds into a human-readable, compact string.
 * - If > 1 hour: returns "Xh Ym" (e.g., "2h 30m").
 * - If < 1 hour: returns "Xm Ys" (e.g., "45m 10s").
 *
 * @param seconds - Total duration in seconds.
 * @returns The formatted duration string.
 */
export const formatDuration = (seconds: number) => {
  if (!seconds) return "0s";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
};

/**
 * Determines the "Gamified" intensity tier based on activity duration.
 * Tiers range from "WARMUP" (< 1h) to "GOD TIER" (> 10h).
 *
 * @param secs - The duration of the activity in seconds.
 * @returns An object containing the corresponding Lucide icon, Tailwind text color class, and display label.
 */
export const getTier = (
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
