import type { JSX } from "react";
import type { ActivityLogsWithDetails } from "../types/activityLog";
import type { ActivityWithLogCount } from "../types/activity";
import {
  Trash2,
  Coffee,
  Hammer,
  Zap,
  Flame,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { APP_CONFIG } from "../constants";

export interface ActivityLogItemProps {
  /** The log entry to display. */
  log: ActivityLogsWithDetails;
  /** The parent activity details (optional, used as fallback for name/color). */
  activity: ActivityWithLogCount | undefined;
  /** Callback to delete the log. */
  onDelete: (logId: string) => void;
}

// --- Pure Helper Functions (No Hooks) ---

const formatDate = (dateInput: Date | string) => {
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

const formatDuration = (seconds: number) => {
  if (!seconds) return "0s";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
};

const getTier = (
  secs: number,
): { icon: LucideIcon; color: string; label: string } => {
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

/**
 * Renders a single activity log card.
 * @remarks
 * Displays duration, start/end times, and an intensity "Tier" badge.
 *
 * @returns A list item (`<li>`) component.
 */
function ActivityLogItemForActivityLogs({
  log,
  activity,
  onDelete,
}: ActivityLogItemProps): JSX.Element {
  const durationSec = log.duration || 0;
  const formattedDuration = formatDuration(durationSec);

  const tier = getTier(durationSec);
  const TierIcon = tier.icon;

  const activityName = log.activityName || activity?.name || "Unknown Activity";
  const activityColor =
    log.activityColor || activity?.color || APP_CONFIG.DEFAULT_ACTIVITY_COLOR;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(log._id);
  };

  return (
    <li className="relative group overflow-hidden rounded-2xl bg-gray-900/40 backdrop-blur-sm border border-white/5 hover:border-white/10 transition-all duration-300 shadow-lg hover:shadow-2xl hover:bg-gray-900/60">
      {/* Left Color Indicator */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2"
        style={{ backgroundColor: activityColor }}
      />

      {/* Delete Button (Visible on Hover) */}
      <button
        type="button"
        onClick={handleDelete}
        className="absolute top-3 right-3 p-2 rounded-lg text-gray-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:text-rose-400 hover:bg-rose-500/10 transition-all z-10 cursor-pointer"
        title="Delete Log"
        aria-label="Delete Log"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="p-5 pl-7 flex flex-col gap-4">
        {/* Header: Activity Name */}
        <div className="pr-8">
          <h3 className="font-bold text-xl text-white tracking-wide truncate text-left">
            {activityName}
          </h3>
        </div>

        {/* Content: Times & Badge */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
          {/* Time Range */}
          <div className="flex flex-col gap-2 min-w-[140px]">
            <div className="flex items-center justify-between gap-4 text-xs font-mono text-gray-400">
              <span className="font-bold uppercase tracking-widest opacity-50 text-[10px]">
                Start
              </span>
              <span className="text-gray-200 text-right">
                {formatDate(log.startTime)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 text-xs font-mono text-gray-400">
              <span className="font-bold uppercase tracking-widest opacity-50 text-[10px]">
                End
              </span>
              <span className="text-gray-200 text-right">
                {formatDate(log.endTime || new Date())}
              </span>
            </div>
          </div>

          {/* Tier Badge / Duration Card */}
          <div className="flex-1 flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl p-2 pr-4 hover:bg-white/10 transition-colors">
            <div
              className={`p-2 rounded-lg bg-gray-900 shadow-inner ${tier.color}`}
            >
              <TierIcon className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span
                className={`text-[9px] font-black uppercase tracking-[0.2em] ${tier.color} opacity-80`}
              >
                {tier.label}
              </span>
              <span className="text-2xl font-bold font-mono text-white leading-none mt-0.5">
                {formattedDuration}
              </span>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

export default ActivityLogItemForActivityLogs;
