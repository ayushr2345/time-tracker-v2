import { useMemo, type JSX } from "react";
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
import {
  Clock,
  Calendar,
  Activity,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Coffee,
  Hammer,
  Zap,
  Flame,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import { useOverview } from "../hooks/logic/useOverview";
import LoadingSpinner from "./LoadingSpinner";
import ActivityHeatmap from "./ActivityHeatMap";
import { APP_CONFIG } from "../constants";

// --- Pure Helper Functions ---

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

const formatDurationDetailed = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`;
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
 * The main dashboard view.
 * @remarks
 * Displays a high-level summary of user activity, including:
 * - Activity cards for the current week.
 * - Charts (Bar & Pie) for visualization.
 * - Time summary cards (Today, Week, Month, Year).
 * - A list of the 5 most recent logs.
 * - The yearly heatmap.
 *
 * @returns The rendered Overview dashboard.
 */
function Overview(): JSX.Element {
  const {
    activities,
    activityLogs,
    activitiesLoading,
    activityLogsLoading,
    formatTime,
    sumLogsByPeriod,
    chartData,
    isChartDataEmpty,
  } = useOverview();

  const isLoading = activitiesLoading || activityLogsLoading;

  // --- Memoized Data Preparation ---

  // 1. Recent Logs (Top 5)
  const recentLogs = useMemo(() => {
    return activityLogs
      .filter((log) => log.status === "completed")
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
      )
      .slice(0, 5);
  }, [activityLogs]);

  // 2. Summary Cards Data Configuration
  const summaryCards = [
    {
      label: "Today",
      value: sumLogsByPeriod(activityLogs, "today"),
      grad: "from-blue-500/20 to-blue-600/5",
      border: "border-blue-500/20",
      icon: "🌅",
    },
    {
      label: "This Week",
      value: sumLogsByPeriod(activityLogs, "week"),
      grad: "from-purple-500/20 to-purple-600/5",
      border: "border-purple-500/20",
      icon: "📅",
    },
    {
      label: "This Month",
      value: sumLogsByPeriod(activityLogs, "month"),
      grad: "from-indigo-500/20 to-indigo-600/5",
      border: "border-indigo-500/20",
      icon: "🗓️",
    },
    {
      label: "This Year",
      value: sumLogsByPeriod(activityLogs, "year"),
      grad: "from-pink-500/20 to-pink-600/5",
      border: "border-pink-500/20",
      icon: "📆",
    },
  ];

  // --- Render ---

  if (isLoading && activities.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8 sm:space-y-12 animate-fade-in pb-12">
      {/* 1. Time Spent per Activity Cards */}
      <section className="space-y-6">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold text-white flex items-center justify-center gap-3">
            <span className="text-3xl">📊</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Activity Breakdown
            </span>
          </h2>
          <p className="text-gray-400 text-base font-medium">This Week</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {activities.length === 0 ? (
            <div className="col-span-full py-12 bg-gray-900/40 rounded-2xl shadow-xl flex flex-col items-center justify-center gap-4 text-center border border-white/5">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
                <BarChartIcon className="w-8 h-8 text-gray-500" />
              </div>
              <div>
                <p className="text-white font-semibold text-lg">
                  No activities found
                </p>
                <p className="text-gray-400 text-sm">
                  Add activities to start tracking!
                </p>
              </div>
            </div>
          ) : (
            activities.map((activity) => {
              // Calculate specific time for this card
              const thisActivityLogs = activityLogs.filter(
                (log) => log.activityId === activity._id,
              );
              const totalTime = sumLogsByPeriod(thisActivityLogs, "week");

              return (
                <div
                  key={activity._id}
                  className="group relative overflow-hidden bg-gray-900/40 backdrop-blur-md rounded-2xl p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border border-white/5 hover:border-white/10"
                >
                  {/* Left Color Indicator */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2"
                    style={{ backgroundColor: activity.color }}
                  />

                  <div className="relative z-10 pl-2">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-white truncate pr-2">
                        {activity.name}
                      </h3>
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg text-xs font-bold text-white/90"
                        style={{ backgroundColor: activity.color }}
                      >
                        {activity.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                        Total This Week
                      </p>
                      <p className="text-3xl font-mono font-bold text-white">
                        {formatTime(totalTime)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 2. Charts Section */}
      <section className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center justify-center gap-3">
          <span className="text-2xl">📈</span>
          <span className="text-gradient">Weekly Analytics</span>
        </h2>

        {isChartDataEmpty(chartData) ? (
          <div className="bg-gray-900/40 p-12 rounded-2xl text-center shadow-xl border border-white/5">
            <div className="flex flex-col items-center gap-4 opacity-60">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
                <PieChartIcon className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-300 font-medium">
                No data available for charts yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/5">
              <h3 className="text-white font-bold mb-6 text-lg flex items-center gap-2">
                <BarChartIcon className="w-5 h-5 text-indigo-400" />
                <span>Hours per Activity</span>
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <XAxis
                    dataKey="name"
                    stroke="#9ca3af"
                    tick={{ fill: "#9ca3af", fontSize: 10 }}
                    interval={0}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    tick={{ fill: "#9ca3af", fontSize: 10 }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                    contentStyle={{
                      backgroundColor: "#111827",
                      borderColor: "rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#f3f4f6",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                    }}
                    itemStyle={{ color: "#e5e7eb" }}
                    labelStyle={{ color: "#9ca3af", marginBottom: "0.5rem" }}
                  />
                  <Bar dataKey="time" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/5">
              <h3 className="text-white font-bold mb-6 text-lg flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-purple-400" />
                <span>Distribution</span>
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="time"
                    nameKey="name"
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={5}
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      borderColor: "rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#f3f4f6",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                    }}
                    itemStyle={{ color: "#e5e7eb" }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px", color: "#9ca3af" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </section>

      {/* 3. Bottom Grid: Summary & Recent Logs */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: Time Summary */}
        <div className="space-y-6 flex flex-col h-full">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Clock className="w-6 h-6 text-blue-400" />
            <span className="text-gradient">Time Summary</span>
          </h2>

          <div className="grid grid-cols-1 gap-4 flex-1">
            {summaryCards.map((item, idx) => (
              <div
                key={idx}
                className={`relative overflow-hidden bg-gradient-to-r ${item.grad} border ${item.border} p-5 rounded-2xl flex items-center justify-between transition-all hover:scale-[1.02] hover:shadow-lg`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{item.icon}</div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">
                      {item.label}
                    </p>
                    <p className="text-2xl font-mono font-bold text-white mt-1">
                      {formatTime(item.value)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Recent Logs */}
        <div className="space-y-6 flex flex-col h-full">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-2xl">📝</span>
            <span className="text-gradient">Recent Logs</span>
          </h2>

          <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl flex-1 flex flex-col min-h-[400px] border border-white/5">
            {recentLogs.length === 0 ? (
              <div className="flex items-center justify-center flex-1 text-center p-10 opacity-60">
                <div>
                  <p className="text-white font-semibold">No logs found</p>
                  <p className="text-gray-500 text-sm">
                    Start tracking to see history
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
                {recentLogs.map((log) => {
                  const activity = activities.find(
                    (a) => a._id === log.activityId,
                  );

                  const durationSec = log.duration || 0;
                  const formattedDuration = formatDurationDetailed(durationSec);

                  const tier = getTier(durationSec);
                  const TierIcon = tier.icon;

                  const activityName =
                    log.activityName || activity?.name || "Unknown";
                  const activityColor =
                    log.activityColor ||
                    activity?.color ||
                    APP_CONFIG.DEFAULT_ACTIVITY_COLOR;

                  return (
                    <div
                      key={log._id}
                      className="relative group overflow-hidden rounded-2xl bg-gray-900/60 border border-white/5 hover:border-white/10 transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-[1.01]"
                    >
                      {/* Left Color Indicator */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2"
                        style={{ backgroundColor: activityColor }}
                      />

                      <div className="p-4 pl-6 flex flex-col gap-3">
                        <h3 className="font-bold text-lg text-white tracking-wide truncate">
                          {activityName}
                        </h3>

                        <div className="flex items-end justify-between gap-4">
                          {/* Times */}
                          <div className="flex flex-col gap-1 min-w-[100px]">
                            <div className="flex justify-between text-[10px] font-mono text-gray-400">
                              <span className="font-bold opacity-50">FROM</span>
                              <span className="text-gray-300">
                                {formatDate(log.startTime)}
                              </span>
                            </div>
                            <div className="flex justify-between text-[10px] font-mono text-gray-400">
                              <span className="font-bold opacity-50">TO</span>
                              <span className="text-gray-300">
                                {formatDate(log.endTime || new Date())}
                              </span>
                            </div>
                          </div>

                          {/* Badge */}
                          <div className="flex items-center gap-2 bg-black/20 rounded-lg p-1.5 pl-2 border border-white/5">
                            <div className="flex flex-col items-end">
                              <span
                                className={`text-[8px] font-black uppercase tracking-widest ${tier.color}`}
                              >
                                {tier.label}
                              </span>
                              <span className="text-sm font-bold font-mono text-white leading-none">
                                {formattedDuration}
                              </span>
                            </div>
                            <div
                              className={`p-1.5 rounded-md bg-gray-800 ${tier.color}`}
                            >
                              <TierIcon className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. ACTIVITY HEATMAP */}
      <section className="space-y-6 pt-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <Calendar className="w-6 h-6 text-purple-400" />
          <span className="text-gradient">Activity Heatmap</span>
        </h2>
        <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/5 overflow-hidden">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-gray-300 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Past 365 Days
            </h3>
          </div>
          <ActivityHeatmap logs={activityLogs} />
        </div>
      </section>
    </div>
  );
}

export default Overview;
