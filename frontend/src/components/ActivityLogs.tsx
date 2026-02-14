import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, Slide } from "react-toastify";
import LoadingSpinner from "./LoadingSpinner";
import { useActivities } from "../hooks/data/useActivities";
import { useActivityLog } from "../hooks/data/useActivityLog";
import {
  Filter,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";
import ActivityLogItemForActivityLogs from "./ActivityLogItemForActivityLogs";
import { useActivityLogs } from "../hooks/logic/useActivityLogs";

function ActivityLogs() {
  const { activityLogs, loading: activityLogsLoading } = useActivityLog();
  const { activities, loading: activitiesLoading } = useActivities();
  const {
    setFilterActivityId,
    setDateFilterType,
    setStartDate,
    setEndDate,
    setGroupByActivity,
    handleDelete,
    goToPage,
    groupedLogs,
    filteredLogs,
    filterActivityId,
    dateFilterType,
    currentLogs,
    setCurrentPage,
    groupByActivity,
    startDate,
    currentPage,
    totalPages,
  } = useActivityLogs();

  const loading = activitiesLoading || activityLogsLoading;
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
              <span
                className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                  groupByActivity
                    ? "text-indigo-300 shadow-indigo-500/50"
                    : "text-gray-400"
                }`}
              >
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
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 transform ${
                    groupByActivity ? "translate-x-5" : "translate-x-0"
                  }`}
                />
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
                              <ActivityLogItemForActivityLogs
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
                      <ActivityLogItemForActivityLogs
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
        toastClassName="bg-gray-900 border border-gray-800 text-white rounded-xl shadow-2xl"
      />
    </div>
  );
}

export default ActivityLogs;
