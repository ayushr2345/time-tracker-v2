import type { JSX } from "react";
import { useActivityHeatMap } from "../hooks/logic/useActivityHeatMap";
import type { ActivityLogsWithDetails } from "../types/activityLog";

export interface ActivityHeatMapProps {
  /** The raw activity logs to visualize */
  logs: ActivityLogsWithDetails[];
}

/**
 * A GitHub-style contribution graph visualization.
 * @remarks
 * Renders a scrollable heatmap of activity intensity over the last year.
 * Includes smart tooltips that adjust position based on screen edges to prevent clipping.
 *
 * @returns The rendered Heatmap component.
 */
function ActivityHeatmap({ logs }: ActivityHeatMapProps): JSX.Element {
  const { weeks, getColor } = useActivityHeatMap(logs);

  return (
    <div className="w-full overflow-x-auto custom-scrollbar pb-4">
      {/* Container with min-width to ensure squares don't squash on mobile */}
      <div className="min-w-[700px] px-1">
        {/* The Grid */}
        <div className="flex gap-1">
          {weeks.map((week, wIndex) => (
            <div key={wIndex} className="flex flex-col gap-1">
              {week.map((day, dIndex) => {
                // --- SMART TOOLTIP POSITIONING ---

                // 1. Vertical: Top rows show tooltip BELOW, Bottom rows show ABOVE
                const isTopRow = dIndex < 3;
                const verticalClass = isTopRow
                  ? "top-full mt-2"
                  : "bottom-full mb-2";

                // 2. Horizontal: First 5 weeks align LEFT, Last 5 weeks align RIGHT, Rest CENTER
                const isFarLeft = wIndex < 5;
                const isFarRight = wIndex > weeks.length - 5;

                let horizontalClass = "left-1/2 -translate-x-1/2"; // Default Center
                if (isFarLeft) horizontalClass = "left-0 translate-x-0";
                if (isFarRight) horizontalClass = "right-0 translate-x-0";

                // 3. Arrow Positioning (to match the horizontal alignment)
                let arrowClass = "left-1/2 -translate-x-1/2";
                if (isFarLeft) arrowClass = "left-1.5";
                if (isFarRight) arrowClass = "right-1.5";

                return (
                  <div
                    key={day.date}
                    className={`
                      relative group w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-sm border transition-all duration-200
                      ${getColor(day.intensity)}
                      hover:scale-125 hover:z-20 hover:border-white/30
                    `}
                  >
                    {/* Tooltip Popup */}
                    <div
                      className={`
                        absolute ${verticalClass} ${horizontalClass} 
                        hidden group-hover:block z-30 pointer-events-none w-max
                      `}
                    >
                      <div className="relative bg-gray-900 text-[10px] text-white px-2 py-1.5 rounded-md border border-white/10 shadow-xl whitespace-nowrap">
                        {/* Data Content */}
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-400">
                            {day.date}
                          </span>
                          <span className="w-px h-3 bg-gray-700"></span>
                          <span className="text-indigo-300 font-bold">
                            {(day.value / 3600).toFixed(1)}h
                          </span>
                        </div>

                        {/* Little Triangle Arrow */}
                        <div
                          className={`absolute ${isTopRow ? "-top-1 border-b-gray-900 border-t-transparent" : "-bottom-1 border-t-gray-900 border-b-transparent"} ${arrowClass} w-0 h-0 border-x-4 border-x-transparent border-y-4`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((intensity) => (
              <div
                key={intensity}
                className={`w-3 h-3 rounded-sm border ${getColor(intensity)}`}
                title={`Intensity Level ${intensity}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

export default ActivityHeatmap;
