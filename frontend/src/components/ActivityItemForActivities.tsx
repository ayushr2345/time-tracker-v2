import type { JSX } from "react";
import { Trash2, Edit2 } from "lucide-react";
import type { ActivityWithLogCount } from "@time-tracker/shared";

interface ActivityItemProps {
  /** The activity object to display. */
  activity: ActivityWithLogCount;
  /** Callback fired when the edit button is clicked. */
  onEdit: (activity: ActivityWithLogCount) => void;
  /** Callback fired when the delete button is clicked. */
  onDelete: (activity: ActivityWithLogCount) => void;
}

/**
 * Renders a single activity card for the library list.
 * @remarks
 * Displays the activity name, color code, and action buttons.
 * Features a hover effect that reveals the action buttons on desktop.
 *
 * @returns A list item (`<li>`) representing the activity.
 */
function ActivityItemForActivities({
  activity,
  onEdit,
  onDelete,
}: ActivityItemProps): JSX.Element {
  return (
    <li className="group relative overflow-hidden rounded-2xl bg-gray-900/50 border border-white/5 hover:border-white/10 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.01]">
      {/* 1. Left Color Indicator Bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2"
        style={{ backgroundColor: activity.color }}
      />

      <div className="p-4 sm:p-5 pl-7 flex items-center justify-between">
        {/* 2. Activity Info & Icon */}
        <div className="flex items-center gap-4">
          {/* Initials Icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shadow-sm transition-transform group-hover:scale-110"
            style={{
              backgroundColor: `${activity.color}20`, // 20% opacity hex
              color: activity.color,
              border: `1px solid ${activity.color}40`, // 40% opacity hex
            }}
          >
            {activity.name.charAt(0).toUpperCase()}
          </div>

          {/* Text Details */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all">
              {activity.name}
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-500 font-mono mt-0.5 flex items-center gap-2">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: activity.color }}
              />
              {activity.color.toUpperCase()}
            </p>
          </div>
        </div>

        {/* 3. Action Buttons */}
        {/* Opacity transition: Visible on mobile, hover-only on desktop */}
        <div className="flex items-center gap-1 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(activity)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Edit Activity"
            aria-label={`Edit ${activity.name}`}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(activity)}
            className="p-2 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete Activity"
            aria-label={`Delete ${activity.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </li>
  );
}

export default ActivityItemForActivities;
