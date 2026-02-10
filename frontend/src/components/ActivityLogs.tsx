import React, { useState, useMemo } from "react";
import "react-toastify/dist/ReactToastify.css";
import LoadingSpinner from "./LoadingSpinner";
import { useActivities } from "../hooks/data/useActivities";
import { useActivityLog } from "../hooks/data/useActivityLog";
import {
  Coffee,
  Hammer,
  Zap,
  Flame,
  Trophy,
  Trash2,
  Filter,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";
import { toast } from "react-toastify";

// --- SUB-COMPONENT: Single Log Item ---
// Extracted to keep the main logic clean
const LogItem = ({ log, activity, onDelete }) => {
  // 1. Duration Logic
  const durationSec = log.duration || 0;
  const hours = Math.floor(durationSec / 3600);
  const minutes = Math.floor((durationSec % 3600) / 60);
  const seconds = Math.floor(durationSec % 60);
  const formattedDuration =
    hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds}s`;

  // 2. Icon Logic
  const getTier = (secs) => {
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

  const tier = getTier(durationSec);
  const TierIcon = tier.icon;

  // 3. Date Formatter
  const formatDate = (dateString) => {
    if (!dateString) return "Now";
    return new Date(dateString).toLocaleString([], {
      month: "short",
      day: "numeric",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Fallbacks
  const activityName = log.activityName || activity?.name || "Unknown Activity";
  const activityColor = log.activityColor || activity?.color || "#6366f1";

  return (
    <li className="relative group overflow-hidden rounded-2xl bg-gray-900/80 border border-white/5 hover:border-white/10 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-[1.01]">
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2"
        style={{ backgroundColor: activityColor }}
      />
      <button
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
};

// --- MAIN COMPONENT ---
function ActivityLogs() {
  const {
    activityLogs,
    loading: activityLogsLoading,
    setActivityLogs,
  } = useActivityLog();
  const { activities, loading: activitiesLoading } = useActivities();

  // --- STATE FOR FILTERS ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [filterActivityId, setFilterActivityId] = useState("ALL");
  const [dateFilterType, setDateFilterType] = useState("ALL"); // 'ALL', 'WEEK', 'CUSTOM'
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [groupByActivity, setGroupByActivity] = useState(false);

  const loading = activitiesLoading || activityLogsLoading;

  // --- DELETE HANDLER ---
  const handleDelete = async (logId: string) => {
    if (confirm("Permanently delete this log?")) {
      // Optimistic update
      setActivityLogs((prev) => prev.filter((l) => l._id !== logId));
      toast.success("Log deleted");
      // Add API call here: await activityLogService.deleteLog(logId);
    }
  };

  // --- FILTERING LOGIC ---
  const filteredLogs = useMemo(() => {
    let result = activityLogs.filter((log) => log.status === "completed");

    // 1. Activity Filter
    if (filterActivityId !== "ALL") {
      result = result.filter((log) => log.activityId === filterActivityId);
    }

    // 2. Date Filter
    if (dateFilterType === "WEEK") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      result = result.filter((log) => new Date(log.startTime) >= oneWeekAgo);
    } else if (dateFilterType === "CUSTOM" && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the whole end day
      result = result.filter((log) => {
        const logDate = new Date(log.startTime);
        return logDate >= start && logDate <= end;
      });
    }

    // 3. Sorting (Ensure newest first)
    return result.sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    );
  }, [activityLogs, filterActivityId, dateFilterType, startDate, endDate]);

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  // Calculate specific logs for current page
  const currentLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage]);

  // Handle Page Change
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // --- GROUPING LOGIC ---
  // We group whatever is on the CURRENT PAGE to allow pagination to still work
  const groupedLogs = useMemo(() => {
    if (!groupByActivity) return null;

    return currentLogs.reduce(
      (acc, log) => {
        // Find name safely
        const act = activities.find((a) => a._id === log.activityId);
        const name = log.activityName || act?.name || "Unknown";

        if (!acc[name]) acc[name] = [];
        acc[name].push(log);
        return acc;
      },
      {} as Record<string, typeof currentLogs>,
    );
  }, [currentLogs, groupByActivity, activities]);

  if (loading && activityLogs.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-6 mt-6 max-w-4xl mx-auto">
        {/* Heading */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold text-white flex items-center justify-center gap-3">
            <span className="text-3xl">📝</span>
            <span className="text-gradient">Recent Activity Logs</span>
          </h2>
          <p className="text-gray-300 text-base font-medium">
            View, filter, and analyze your history
          </p>
        </div>

        {/* --- CONTROL BAR (Filters) --- */}
        <div className="glass rounded-2xl p-4 sm:p-5 flex flex-col gap-4 border border-white/10 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Left: Quick Filters */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Activity Selector */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={filterActivityId}
                  onChange={(e) => {
                    setFilterActivityId(e.target.value);
                    setCurrentPage(1); // Reset to page 1 on filter change
                  }}
                  className="pl-9 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none min-w-[150px]"
                >
                  <option value="ALL">All Activities</option>
                  {activities.map((act) => (
                    <option key={act._id} value={act._id}>
                      {act.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Week Button */}
              <button
                onClick={() => {
                  if (dateFilterType === "WEEK") setDateFilterType("ALL");
                  else setDateFilterType("WEEK");
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  dateFilterType === "WEEK"
                    ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                    : "bg-gray-800/50 border-gray-700 text-gray-400 hover:text-white"
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                This Week
              </button>
            </div>

            {/* Right: Group Toggle (High Visibility) */}
            <div className="flex items-center gap-3 ml-auto bg-gray-800/40 p-2 rounded-xl border border-white/5">
              <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                groupByActivity ? "text-indigo-300 shadow-indigo-500/50" : "text-gray-400"
              }`}>
                Group By Activity
              </span>
              
              <button
                onClick={() => setGroupByActivity(!groupByActivity)}
                className={`relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 ${
                  groupByActivity 
                    ? "bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                    : "bg-gray-600"
                }`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 transform ${
                  groupByActivity ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
            </div>
          </div>

          {/* Date Range Inputs (Only show if not Week mode) */}
          {dateFilterType !== "WEEK" && (
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-700/50">
              <span className="text-xs text-gray-500 font-bold uppercase">
                Custom Range:
              </span>
              <input
                type="date"
                className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-1 text-sm text-white [color-scheme:dark]"
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDateFilterType("CUSTOM");
                  setCurrentPage(1);
                }}
              />
              <span className="text-gray-500">-</span>
              <input
                type="date"
                className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-1 text-sm text-white [color-scheme:dark]"
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDateFilterType("CUSTOM");
                  setCurrentPage(1);
                }}
              />
              {(dateFilterType === "CUSTOM" || startDate) && (
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    setDateFilterType("ALL");
                  }}
                  className="text-xs text-red-400 hover:underline ml-2"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* --- LIST SECTION --- */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
              <span className="text-xl">📋</span>
              <span>Logs Found ({filteredLogs.length})</span>
            </h3>
            <span className="text-xs text-gray-500 font-mono">
              Page {currentPage} of {totalPages || 1}
            </span>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8 shadow-xl space-y-5 min-h-[300px]">
            {filteredLogs.length === 0 ? (
              <div className="glass rounded-xl p-10 text-center shadow-xl opacity-80">
                <div className="flex flex-col items-center gap-4">
                  <Filter className="w-12 h-12 text-gray-600" />
                  <p className="text-white font-semibold text-lg">
                    No logs match your filter
                  </p>
                  <button
                    onClick={() => {
                      setFilterActivityId("ALL");
                      setDateFilterType("ALL");
                    }}
                    className="text-blue-400 hover:text-blue-300 text-sm underline"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* RENDER LOGS */}
                {groupByActivity ? (
                  // --- GROUPED VIEW ---
                  <div className="space-y-8">
                    {Object.entries(groupedLogs || {}).map(
                      ([actName, logs]: [string, any[]]) => (
                        <div key={actName} className="space-y-3">
                          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                            <Layers className="w-4 h-4 text-indigo-400" />
                            <h4 className="text-lg font-bold text-indigo-200">
                              {actName}
                            </h4>
                            <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full text-gray-400">
                              {logs.length}
                            </span>
                          </div>
                          <ul className="space-y-4">
                            {logs.map((log) => (
                              <LogItem
                                key={log._id}
                                log={log}
                                activity={activities.find(
                                  (a) => a._id === log.activityId,
                                )}
                                onDelete={handleDelete}
                              />
                            ))}
                          </ul>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  // --- STANDARD LIST VIEW ---
                  <ul className="space-y-4">
                    {currentLogs.map((log) => (
                      <LogItem
                        key={log._id}
                        log={log}
                        activity={activities.find(
                          (a) => a._id === log.activityId,
                        )}
                        onDelete={handleDelete}
                      />
                    ))}
                  </ul>
                )}

                {/* --- PAGINATION CONTROLS --- */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 pt-6 border-t border-white/5">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (p) =>
                            p === 1 ||
                            p === totalPages ||
                            (p >= currentPage - 1 && p <= currentPage + 1),
                        ) // Smart ellipsis logic could go here, for now simpler
                        .map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                              currentPage === pageNum
                                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                                : "bg-gray-800/50 text-gray-400 hover:bg-gray-700"
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}
                    </div>

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityLogs;
