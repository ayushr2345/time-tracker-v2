import React, { useState } from "react";
import UI from "./components/UI";
import Overview from "./components/Overview";
import TimerMode from "./components/TimerMode";
import ManualEntryMode from "./components/ManualEntryMode";
import Activities from "./components/Activities";
import ActivityLogs from "./components/ActivityLogs";
import {
  LayoutDashboard,
  Timer,
  Edit3,
  Target,
  History,
  Activity,
} from "lucide-react";

/**
 * Main application component.
 * @returns JSX.Element
 */
function App() {
  const [selectedTab, setSelectedTab] = useState("Overview");

  // Navigation Config
  const tabs = [
    { id: "Overview", label: "Overview", icon: LayoutDashboard },
    { id: "Timer Mode", label: "Timer", icon: Timer },
    { id: "Manual Entry Mode", label: "Manual Entry", icon: Edit3 },
    { id: "Activities", label: "Activities", icon: Target },
    { id: "ActivityLogs", label: "History", icon: History },
  ];

  return (
    <>
      <div className="min-h-screen relative text-gray-100 font-sans selection:bg-purple-500/30">
        <UI />

        <main className="relative z-10 p-4 sm:p-6 lg:p-8 min-h-screen flex flex-col items-center">
          <div className="w-full max-w-6xl space-y-8 sm:space-y-12">
            {/* 1. Header Section */}
            <div className="text-center space-y-4 pt-4 sm:pt-8">
              <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 mb-2 backdrop-blur-sm shadow-xl">
                <Activity className="w-8 h-8 text-indigo-400" />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-lg">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient">
                  Activity Tracker
                </span>
              </h1>
              <p className="text-gray-400 text-lg font-medium max-w-lg mx-auto leading-relaxed">
                Track your focus, analyze your time, and master your
                productivity.
              </p>
            </div>

            {/* 2. Navigation Tabs (Floating Dock Style) */}
            <div className="sticky top-4 z-50 flex justify-center">
              <div className="glass p-1.5 rounded-2xl border border-white/10 shadow-2xl flex flex-wrap justify-center gap-1 sm:gap-2 bg-gray-900/80 backdrop-blur-xl">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = selectedTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedTab(tab.id)}
                      className={`
                        relative px-4 sm:px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 flex items-center gap-2.5
                        ${
                          isActive
                            ? "text-white shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] bg-white/10 border border-white/10"
                            : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                        }
                      `}
                    >
                      <Icon
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? "text-indigo-400" : "opacity-70"}`}
                      />
                      <span>{tab.label}</span>

                      {/* Active Indicator Dot */}
                      {isActive && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,1)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Main Content Area */}
            <div className="animate-fade-in-up pb-10">
              {selectedTab === "Overview" && <Overview />}
              {selectedTab === "Timer Mode" && <TimerMode />}
              {selectedTab === "Manual Entry Mode" && <ManualEntryMode />}
              {selectedTab === "Activities" && <Activities />}
              {selectedTab === "ActivityLogs" && <ActivityLogs />}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
