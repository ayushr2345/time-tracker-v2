import UI from "./components/UI";
import Overview from "./components/Overview";
import TimerMode from "./components/TimerMode";
import ManualEntryMode from "./components/ManualEntryMode";
import Activities from "./components/Activities";
import React from "react";

/**
 * Main application component with tab-based navigation.
 * @remarks
 * Renders the main UI with tabs for Overview, Timer Mode, Manual Entry Mode, and Activities.
 * Manages tab selection state and renders appropriate content based on selected tab.
 * @returns The main app component with tab navigation
 */
function App() {
  const tabs = ["Overview", "Timer Mode", "Manual Entry Mode", "Activities"];
  const [selectedTab, setSelectedTab] = React.useState(tabs[0]);

  return (
    <>
      <div className="min-h-screen relative overflow-hidden">
        <UI />
        <main className="min-h-screen text-gray-100 p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto glass rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 space-y-8 sm:space-y-10">
            {/* Header with gradient text */}
            <div className="text-center space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold flex items-center justify-center gap-3">
                <span className="text-4xl sm:text-5xl lg:text-6xl">🎯</span>
                <span className="text-gradient animate-gradient bg-clip-text bg-linear-to-r from-blue-400 via-purple-400 to-pink-400">
                  Activity Tracker
                </span>
              </h1>
              <h2 className="text-gray-300 text-1xl font-medium ">
                Track your time with elegance and precision
              </h2>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center flex-wrap gap-3 sm:gap-4">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-6 py-3 rounded-xl font-bold text-base transition-all duration-300 relative overflow-hidden group ${
                    selectedTab === tab
                      ? "bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50 scale-105"
                      : "glass text-gray-300 hover:text-white hover:bg-white/10 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30"
                  }`}
                >
                  <span className="relative z-10">{tab}</span>
                  {selectedTab === tab && (
                    <div className="absolute inset-0 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="mt-8 text-center">
              {selectedTab === "Overview" && <Overview />}
              {selectedTab === "Timer Mode" && <TimerMode />}
              {selectedTab === "Manual Entry Mode" && <ManualEntryMode />}
              {selectedTab === "Activities" && <Activities />}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
