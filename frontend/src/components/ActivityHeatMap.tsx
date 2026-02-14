import "react-toastify/dist/ReactToastify.css";
import { useActivityHeatMap } from "../hooks/logic/useActivityHeatMap";
import type { ActivityLogsWithDetails } from "../types/activityLog";

export interface ActivityHeatMapProps {
  logs: ActivityLogsWithDetails[];
}

function ActivityHeatmap({ logs }: ActivityHeatMapProps) {
  const { weeks, getColor } = useActivityHeatMap(logs);

  return (
    <div className="w-full overflow-x-auto custom-scrollbar pb-2">
      <div className="min-w-[700px]">
        <div className="flex gap-1">
          {weeks.map((week, wIndex) => (
            <div key={wIndex} className="flex flex-col gap-1">
              {week.map((day, dIndex) => {
                // SMART POSITIONING LOGIC
                // 1. Vertical: If in top 3 rows, show tooltip BELOW. Else ABOVE.
                const isTopRow = dIndex < 3;
                const verticalClass = isTopRow
                  ? "top-full mt-2"
                  : "bottom-full mb-2";

                // 2. Horizontal: If far left, align left. If far right, align right. Else center.
                const isFarLeft = wIndex < 5;
                const isFarRight = wIndex > weeks.length - 5;
                let horizontalClass = "left-1/2 -translate-x-1/2";
                if (isFarLeft) horizontalClass = "left-0 translate-x-0";
                if (isFarRight) horizontalClass = "right-0 translate-x-0";

                return (
                  <div
                    key={day.date}
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-sm border ${getColor(day.intensity)} transition-all hover:scale-125 hover:z-20 relative group`}
                  >
                    {/* Tooltip */}
                    <div
                      className={`absolute ${verticalClass} ${horizontalClass} w-max hidden group-hover:block z-30 pointer-events-none`}
                    >
                      <div className="bg-gray-900 text-[10px] text-white px-2 py-1 rounded-md border border-white/10 shadow-xl whitespace-nowrap z-50">
                        <span className="font-bold text-gray-400">
                          {day.date}
                        </span>
                        <span className="mx-1 text-gray-600">|</span>
                        <span className="text-indigo-300 font-bold">
                          {(day.value / 3600).toFixed(1)}h
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-400">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-white/5"></div>
            <div className="w-3 h-3 rounded-sm bg-indigo-900/40"></div>
            <div className="w-3 h-3 rounded-sm bg-indigo-700/60"></div>
            <div className="w-3 h-3 rounded-sm bg-indigo-500"></div>
            <div className="w-3 h-3 rounded-sm bg-cyan-400"></div>
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

export default ActivityHeatmap;
