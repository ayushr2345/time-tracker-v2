import "react-toastify/dist/ReactToastify.css";
import { Trash2 } from "lucide-react";
import type { ActivityLogsWithDetails } from "../types/activityLog";
import type { ActivityWithLogCount } from "../types/activity";
import { useActivityLogs } from "../hooks/logic/useActivityLogs";
import { APP_CONFIG } from "../constants";

export interface ActivityLogItemForActivityLogsProps {
  log: ActivityLogsWithDetails;
  activity: ActivityWithLogCount | undefined;
  onDelete: (activityId: string) => void;
}

function ActivityLogItemForActivityLogs({
  log,
  activity,
  onDelete,
}: ActivityLogItemForActivityLogsProps) {
  const { formatDate, getTier } = useActivityLogs();

  const durationSec = log.duration || 0;
  const formattedDuration =
    Math.floor(durationSec / 3600) > 0
      ? `${Math.floor(durationSec / 3600)}h ${Math.floor((durationSec % 3600) / 60)}m`
      : `${Math.floor((durationSec % 3600) / 60)}m ${Math.floor(durationSec % 60)}s`;

  const tier = getTier(durationSec);
  const TierIcon = tier.icon;
  const activityName = log.activityName || activity?.name || "Unknown Activity";
  const activityColor =
    log.activityColor || activity?.color || APP_CONFIG.DEFAULT_ACTIVITY_COLOR;

  return (
    <li className="relative group overflow-hidden rounded-2xl bg-gray-900/80 border border-white/5 hover:border-white/10 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-[1.01]">
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2"
        style={{ backgroundColor: activityColor }}
      />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(log._id);
        }}
        className="absolute top-3 right-3 p-2 rounded-lg text-gray-600 opacity-0 group-hover:opacity-100 hover:text-rose-400 hover:bg-rose-500/10 transition-all z-10 cursor-pointer"
        title="Delete Log"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="p-5 pl-7 flex flex-col gap-4">
        <div className="pr-8">
          <h3 className="font-bold text-xl text-white tracking-wide truncate text-left">
            {activityName}
          </h3>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
          <div className="flex flex-col gap-2 min-w-[140px]">
            <div className="flex items-center justify-between gap-4 text-xs font-mono text-gray-400">
              <span className="font-bold uppercase tracking-widest opacity-60">
                From
              </span>
              <span className="text-gray-200 text-right">
                {formatDate(log.startTime)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 text-xs font-mono text-gray-400">
              <span className="font-bold uppercase tracking-widest opacity-60">
                To
              </span>
              <span className="text-gray-200 text-right">
                {formatDate(log.endTime || new Date())}
              </span>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl p-2 pr-4">
            <div
              className={`p-2 rounded-lg bg-gray-800 shadow-inner ${tier.color}`}
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
