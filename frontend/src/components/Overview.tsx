import { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

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

import type { Activity } from "../types/activity";
import type { ActivityLogEntry } from "../types/activityLog";
import { getInitialActivities, getInitialRecords } from "../data/fixtures";

/**
 * Sums activity logs by a specified time period.
 * @param logs                                 - Array of activity logs to sum
 * @param period                               - Time period to filter by (today, week, month, lastMonth, year, prevYear)
 * @returns number                             - Total duration in seconds for the specified period
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
    const start = log.startTime;
    const end = log.endTime;
    const duration = (end.getTime() - start.getTime()) / 1000; // seconds

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

    return total;
  }, 0);
};

/**
 * Formats seconds into a human-readable time string (hours and minutes).
 * @param seconds                              - Total seconds to format
 * @returns string                             - Formatted time string like "2h 30m"
 */
const formatTimeNew = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hrs}h ${mins}m`;
};

/**
 * Overview component displaying time tracking statistics and charts.
 * @remarks
 * Shows time spent per activity with bar and pie charts for the current week.
 * Displays time summaries for different periods (today, week, month, year).
 * @returns JSX.Element  - The overview dashboard with charts and statistics
 */
function Overview() {
  const [activities] = useState<Activity[]>(getInitialActivities());
  const [logs] = useState<ActivityLogEntry[]>(getInitialRecords());
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);

  // Calculate data for charts
  const chartData = activities.map((activity, index) => {
    const logsForActivity = logs.filter(
      (log) => log.activityId === activity._id,
    );
    const total = sumLogsByPeriod(logsForActivity, "week");
    return {
      name: activity.name,
      time: parseFloat((total / 3600).toFixed(2)), // convert to hours
      color: activity.color || chartColors[index % chartColors.length],
    };
  });

  useEffect(() => {
    console.log("loaded");
    setIsLoadingOverview(false);
  }, []);
  return (
    <div className="space-y-8 sm:space-y-10 px-2 sm:px-4 py-4 sm:py-6">
      {isLoadingOverview ? (
        <div className="flex justify-center items-center h-40">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500 border-solid"></div>
            <div
              className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-500 border-solid"
              style={{
                animationDirection: "reverse",
                animationDuration: "1s",
              }}
            ></div>
          </div>
        </div>
      ) : (
        <>
          {/* 1. Time Spent per Activity */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                <span className="text-2xl">📊</span>
                <span className="text-gradient">Time Spent per Activity</span>
              </h2>
              <span className="text-sm text-gray-300 font-medium glass px-4 py-2 rounded-xl">
                This Week
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {isLoadingOverview ? (
                <div className="h-32 w-full col-span-full flex justify-center items-center">
                  <span className="text-gray-400">Loading...</span>
                </div>
              ) : activities.length === 0 ? (
                <div className="col-span-full w-full flex items-center justify-center p-10 glass rounded-2xl shadow-xl">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-10 h-10 text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-white font-semibold text-lg">
                      No activities found for this week
                    </p>
                    <p className="text-gray-400 text-sm">
                      Add activities to start tracking!
                    </p>
                  </div>
                </div>
              ) : (
                activities.map((activity) => {
                  const activityLogs = logs.filter(
                    (log) => log.activityId === activity._id,
                  );
                  const totalTime = sumLogsByPeriod(activityLogs, "week");
                  console.log(activity.name, totalTime);

                  return (
                    <div
                      key={activity._id}
                      className="group relative overflow-hidden glass rounded-2xl p-6 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                      style={{
                        borderLeft: `4px solid ${activity.color}`,
                        boxShadow: `0 4px 20px ${activity.color}30, 0 0 0 1px rgba(255,255,255,0.1)`,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all">
                            {activity.name}
                          </h3>
                          <div
                            className="w-5 h-5 rounded-full shadow-lg transition-all"
                            style={{
                              backgroundColor: activity.color,
                              boxShadow: `0 0 15px ${activity.color}80`,
                            }}
                          ></div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-gray-400 text-sm font-medium flex items-center gap-2">
                            <span className="text-base">⏱️</span>
                            <span>Total This Week</span>
                          </p>
                          <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                            {formatTimeNew(totalTime)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* 2. Weekly Analytics */}
          <section className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center justify-center gap-3">
              <span className="text-2xl">📈</span>
              <span className="text-gradient">Weekly Analytics</span>
            </h2>

            {chartData.length === 0 ? (
              <div className="glass text-white p-10 rounded-2xl text-center shadow-xl">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-10 h-10 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <p className="font-semibold text-lg">
                    No data available for charts
                  </p>
                  <p className="text-gray-400 text-sm">
                    Start tracking activities to see analytics
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div className="glass rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <h3 className="text-white font-bold mb-5 text-lg flex items-center gap-3">
                    <span className="text-xl">📊</span>
                    <span>Hours Spent Per Activity</span>
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData}>
                      <XAxis
                        dataKey="name"
                        stroke="#9ca3af"
                        tick={{
                          fill: "#d1d5db",
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                        axisLine={{ stroke: "#4b5563" }}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        tick={{
                          fill: "#d1d5db",
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                        axisLine={{ stroke: "#4b5563" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(15, 23, 42, 0.95)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          borderRadius: "12px",
                          backdropFilter: "blur(10px)",
                          color: "#e2e8f0",
                        }}
                        cursor={{ fill: "rgba(147, 51, 234, 0.1)" }}
                      />
                      <Bar dataKey="time" radius={[8, 8, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`bar-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="glass rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <h3 className="text-white font-bold mb-5 text-lg flex items-center gap-3">
                    <span className="text-xl">🥧</span>
                    <span>Time Distribution</span>
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="time"
                        nameKey="name"
                        outerRadius={100}
                        label={({ name, percent }) =>
                          `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(15, 23, 42, 0.95)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          borderRadius: "12px",
                          backdropFilter: "blur(10px)",
                          color: "#e2e8f0",
                        }}
                      />
                      <Legend
                        wrapperStyle={{
                          color: "#d1d5db",
                          fontSize: "12px",
                          fontWeight: 500,
                        }}
                        iconType="circle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </section>

          {/* 3. Time Summary + Recent Logs */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Time Summary */}
            <div className="space-y-4 flex flex-col h-full">
              <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                <span className="text-2xl">⏱️</span>
                <span className="text-gradient">Time Summary</span>
              </h2>
              <div className="grid grid-cols-1 gap-4 flex-1 content-start">
                {isLoadingOverview ? (
                  <div className="h-24 w-full glass rounded-xl animate-pulse" />
                ) : activities.length === 0 ? (
                  <div className="flex items-center justify-center p-10 glass rounded-xl shadow-xl flex-1 min-h-[200px]">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-10 h-10 text-purple-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-white font-semibold text-lg">
                        No logs found
                      </p>
                      <p className="text-gray-400 text-sm">
                        Start tracking to see summary
                      </p>
                    </div>
                  </div>
                ) : (
                  [
                    {
                      label: "Today",
                      value: sumLogsByPeriod(logs, "today"),
                      gradient: "from-blue-500 via-blue-600 to-cyan-500",
                      icon: "🌅",
                    },
                    {
                      label: "This Week",
                      value: sumLogsByPeriod(logs, "week"),
                      gradient: "from-purple-500 via-purple-600 to-pink-500",
                      icon: "📅",
                    },
                    {
                      label: "This Month",
                      value: sumLogsByPeriod(logs, "month"),
                      gradient: "from-indigo-500 via-indigo-600 to-purple-500",
                      icon: "📆",
                    },
                    {
                      label: "This Year",
                      value: sumLogsByPeriod(logs, "year"),
                      gradient: "from-pink-500 via-pink-600 to-rose-500",
                      icon: "🗓️",
                    },
                    {
                      label: "Previous Year",
                      value: sumLogsByPeriod(logs, "prevYear"),
                      gradient: "from-rose-500 via-rose-600 to-purple-500",
                      icon: "🗓️",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className={`group relative overflow-hidden bg-gradient-to-br ${item.gradient} p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]`}
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
                      <div className="relative z-10 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-white/90 font-semibold flex items-center gap-2 mb-2">
                            <span className="text-base">{item.icon}</span>
                            <span>{item.label}</span>
                          </p>
                          <p className="text-3xl font-extrabold text-white">
                            {formatTimeNew(item.value)}
                          </p>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <span className="text-2xl">{item.icon}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Logs */}
            <div className="space-y-4 flex flex-col h-full">
              <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                <span className="text-2xl">📅</span>
                <span className="text-gradient">Recent Logs</span>
              </h2>
              <div className="glass rounded-xl overflow-hidden shadow-xl flex-1 flex flex-col min-h-0">
                {isLoadingOverview ? (
                  <div className="h-12 w-full glass animate-pulse rounded-xl" />
                ) : activities.length === 0 || logs.length === 0 ? (
                  <div className="flex items-center justify-center p-10 flex-1">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-10 h-10 text-purple-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                      </div>
                      <p className="text-white font-semibold text-lg">
                        No logs found
                      </p>
                      <p className="text-gray-400 text-sm">
                        Start tracking to see recent logs
                      </p>
                    </div>
                  </div>
                ) : (
                  <ul className="divide-y divide-white/10 flex-1 overflow-y-auto">
                    {logs
                      .slice(-5)
                      .reverse()
                      .map((log) => {
                        const activity = activities.find(
                          (a) => a._id === log.activityId,
                        );

                        const today = new Date().toISOString().split("T")[0];
                        const start = new Date(`${today}T${log.startTime}`);
                        const end = new Date(`${today}T${log.endTime}`);
                        const duration =
                          (end.getTime() - start.getTime()) / 1000;

                        return (
                          <li
                            key={log._id}
                            className="px-5 sm:px-6 py-9 flex justify-between items-center hover:bg-white/5 transition-all duration-300 group"
                          >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div
                                className="w-4 h-4 rounded-full flex-shrink-0 transition-all"
                                style={{
                                  backgroundColor: activity?.color || "#6366f1",
                                  boxShadow: `0 0 12px ${
                                    activity?.color || "#6366f1"
                                  }80`,
                                }}
                              ></div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all truncate text-base">
                                  {activity?.name ?? "Unknown Activity"}
                                </p>
                                <p className="text-sm text-gray-400 mt-1.5 flex items-center gap-2">
                                  <span className="text-base">🕐</span>
                                  <span>
                                    {start.toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}{" "}
                                    -{" "}
                                    {end.toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <span className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 px-4 py-2 glass rounded-xl">
                                {isNaN(duration)
                                  ? "Invalid"
                                  : formatTimeNew(duration)}
                              </span>
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default Overview;

// possible refactors:
// 1. called formatTimeNew in multiple places - can be moved to a utility file
// 2. called sumLogsByPeriod in multiple places - can be moved to a utility file
// 3. similar toasts, buttons overall in the UI - can be abstracted into reusable components
