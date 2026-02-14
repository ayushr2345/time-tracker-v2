import type { JSX } from "react";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Filter,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Layers,
  X,
} from "lucide-react";

import LoadingSpinner from "./LoadingSpinner";
import ActivityLogItemForActivityLogs from "./ActivityLogItemForActivityLogs";
import { useActivities } from "../hooks/data/useActivities";
import { useActivityLog } from "../hooks/data/useActivityLog";
import { useActivityLogs } from "../hooks/logic/useActivityLogs";

/**
 * The main container for viewing history.
 * @remarks
 * Displays a paginated list of activity logs with filtering, grouping, and date range capabilities.
 *
 * @returns The rendered Activity Logs history page.
 */
function ActivityLogs(): JSX.Element {
  // Data Hooks
  const { activityLogs, loading: activityLogsLoading } = useActivityLog();
  const { activities, loading: activitiesLoading } = useActivities();

  // Logic Hook (Filtering, Pagination, Grouping)
  const {
    filteredLogs,
    currentLogs,
    groupedLogs,
    filterActivityId,
    setFilterActivityId,
    dateFilterType,
    setDateFilterType,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    groupByActivity,
    setGroupByActivity,
    currentPage,
    setCurrentPage,
    totalPages,
    goToPage,
    handleDelete,
  } = useActivityLogs();

  const isLoading = activitiesLoading || activityLogsLoading;

  // --- Handlers ---

  const handleClearFilters = () => {
    setFilterActivityId("ALL");
    setDateFilterType("ALL");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const handleWeekFilterToggle = () => {
    if (dateFilterType === "WEEK") {
      setDateFilterType("ALL");
    } else {
      setDateFilterType("WEEK");
    }
    setCurrentPage(1);
  };

  // --- Render ---

  if (isLoading && activityLogs.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="pb-12">
      <div className="flex flex-col gap-6 mt-6 max-w-4xl mx-auto px-4 sm:px-0">
        {/* 1. Header Section */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold text-white flex items-center justify-center gap-3">
            <span className="text-3xl">📝</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              Recent Activity Logs
            </span>
          </h2>
          <p className="text-gray-400 text-base font-medium">
            View, filter, and analyze your history.
          </p>
        </div>

        {/* 2. Control Bar (Filters & Toggles) */}
        <div className="bg-gray-900/60 backdrop-blur-md rounded-2xl p-4 sm:p-5 flex flex-col gap-4 border border-white/10 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Left: Quick Filters */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Activity Selector */}
              <div className="relative group">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                <select
                  value={filterActivityId}
                  onChange={(e) => {
                    setFilterActivityId(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 pr-8 py-2.5 bg-gray-950/50 border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none min-w-[160px] cursor-pointer hover:border-gray-600 transition-colors"
                >
                  <option value="ALL">All Activities</option>
                  {activities.map((act) => (
                    <option key={act._id} value={act._id}>
                      {act.name}
                    </option>
                  ))}
                </select>
                {/* Custom Chevron */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Week Button */}
              <button
                onClick={handleWeekFilterToggle}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  dateFilterType === "WEEK"
                    ? "bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                    : "bg-gray-950/50 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600"
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                This Week
              </button>
            </div>

            {/* Right: Group Toggle */}
            <label className="flex items-center gap-3 cursor-pointer bg-gray-950/30 p-2 pr-4 rounded-xl border border-white/5 hover:bg-gray-950/50 transition-colors ml-auto">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={groupByActivity}
                  onChange={() => setGroupByActivity(!groupByActivity)}
                />
                <div
                  className={`w-10 h-6 rounded-full shadow-inner transition-colors duration-300 ${
                    groupByActivity ? "bg-indigo-600" : "bg-gray-700"
                  }`}
                />
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${
                    groupByActivity ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
              <span
                className={`text-xs font-bold uppercase tracking-wider select-none ${
                  groupByActivity ? "text-indigo-300" : "text-gray-400"
                }`}
              >
                Group By Activity
              </span>
            </label>
          </div>

          {/* Date Range Inputs (Conditional) */}
          {dateFilterType !== "WEEK" && (
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-800 animate-fade-in-down">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wide">
                Custom Range:
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDateFilterType("CUSTOM");
                  setCurrentPage(1);
                }}
                className="bg-gray-950/50 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [color-scheme:dark]"
              />
              <span className="text-gray-600 font-bold">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDateFilterType("CUSTOM");
                  setCurrentPage(1);
                }}
                className="bg-gray-950/50 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [color-scheme:dark]"
              />

              {(dateFilterType === "CUSTOM" || startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    setDateFilterType("ALL");
                  }}
                  className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2 py-1 rounded-md transition-colors ml-2"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* 3. List Content Section */}
        <div className="space-y-4">
          {/* List Header */}
          <div className="flex justify-between items-center px-2">
            <h3 className="text-lg font-bold text-gray-200 flex items-center gap-3">
              <span>Logs Found</span>
              <span className="text-xs font-normal bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full border border-gray-700">
                {filteredLogs.length}
              </span>
            </h3>
            <span className="text-xs text-gray-500 font-mono">
              Page {currentPage} of {totalPages || 1}
            </span>
          </div>

          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl border border-white/5 min-h-[300px]">
            {filteredLogs.length === 0 ? (
              // Empty State
              <div className="flex flex-col items-center justify-center h-64 gap-4 opacity-70">
                <div className="p-4 bg-gray-800/50 rounded-full border border-gray-700">
                  <Filter className="w-8 h-8 text-gray-500" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-gray-300 font-semibold text-lg">
                    No logs match your filters
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="text-blue-400 hover:text-blue-300 text-sm hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* VIEW MODE: GROUPED VS LIST */}
                {groupByActivity && groupedLogs ? (
                  // --- GROUPED VIEW ---
                  <div className="space-y-8 animate-fade-in">
                    {Object.entries(groupedLogs).map(([actName, logs]) => (
                      <div key={actName} className="space-y-3">
                        {/* Group Header */}
                        <div className="flex items-center gap-3 pb-2 border-b border-white/10">
                          <Layers className="w-4 h-4 text-indigo-400" />
                          <h4 className="text-lg font-bold text-indigo-200">
                            {actName}
                          </h4>
                          <span className="text-xs font-mono bg-gray-800 px-2 py-0.5 rounded text-gray-400">
                            {logs.length}
                          </span>
                        </div>

                        {/* Group Items */}
                        <ul className="space-y-3 pl-2 sm:pl-4 border-l border-white/5">
                          {logs.map((log) => (
                            <ActivityLogItemForActivityLogs
                              key={log._id}
                              log={log}
                              activity={activities.find(
                                (a) => a._id === log.activityId,
                              )}
                              onDelete={() => handleDelete(log._id)}
                            />
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  // --- STANDARD LIST VIEW ---
                  <ul className="space-y-3 animate-fade-in">
                    {currentLogs.map((log) => (
                      <ActivityLogItemForActivityLogs
                        key={log._id}
                        log={log}
                        activity={activities.find(
                          (a) => a._id === log.activityId,
                        )}
                        onDelete={() => handleDelete(log._id)}
                      />
                    ))}
                  </ul>
                )}

                {/* --- PAGINATION CONTROLS --- */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 pt-8 mt-4 border-t border-white/5">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (p) =>
                            p === 1 ||
                            p === totalPages ||
                            (p >= currentPage - 1 && p <= currentPage + 1),
                        )
                        .map((pageNum) => {
                          // Insert ellipsis logic if needed visually, handled loosely here
                          return (
                            <button
                              key={pageNum}
                              onClick={() => goToPage(pageNum)}
                              className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                                currentPage === pageNum
                                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-110"
                                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                    </div>

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      aria-label="Next Page"
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

      <ToastContainer
        transition={Slide}
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastClassName="!bg-gray-900 !border !border-gray-800 !text-white !rounded-xl !shadow-2xl"
      />
    </div>
  );
}

export default ActivityLogs;
