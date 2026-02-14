import type { ActivityWithLogCount } from "../types/activity";
import { Trash2, Edit2 } from "lucide-react";

export interface ActivityItemForActivitiesProps {
  activity: ActivityWithLogCount;
  onEdit: (activity: ActivityWithLogCount) => void;
  onDelete: (activity: ActivityWithLogCount) => void;
}

function ActivityItemForActivities({
  activity,
  onEdit,
  onDelete,
}: ActivityItemForActivitiesProps) {
  return (
    <li className="group relative overflow-hidden rounded-2xl bg-gray-900/50 border border-white/5 hover:border-white/10 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.01]">
      {/* Left Color Bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2"
        style={{ backgroundColor: activity.color }}
      />

      <div className="p-5 pl-7 flex items-center justify-between">
        {/* Activity Info */}
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shadow-sm"
            style={{
              backgroundColor: `${activity.color}20`,
              color: activity.color,
              border: `1px solid ${activity.color}40`,
            }}
          >
            {activity.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all">
              {activity.name}
            </h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              {activity.color.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(activity)}
            className="p-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            title="Edit Activity"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(activity)}
            className="p-2.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
            title="Delete Activity"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </li>
  );
}

export default ActivityItemForActivities;
