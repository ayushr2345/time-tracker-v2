/* DEV-ONLY fixtures and helpers
   These are intended for local development/testing only. Use the
   VITE_USE_DUMMY_DATA env var (see .env.example) to enable dummy data.
   They are safe to commit (non-secret) and are ignored in production
   by default when the env var is not set.
*/

import type { Activity } from "../types/activity";
import type { ActivityLogEntry } from "../types/activityLog";

export const DEFAULT_ACTIVITIES: Activity[] = [
  { _id: "1", name: "Development", color: "#3b82f6" },
  { _id: "2", name: "Design", color: "#8b5cf6" },
  { _id: "3", name: "Review", color: "#ec4899" },
  { _id: "4", name: "Office", color: "#f59e0b" },
];

export const DEFAULT_RECORDS: ActivityLogEntry[] = (() => {
  const records: ActivityLogEntry[] = [];
  const activityIds = ["1", "2", "3", "4"];
  const now = new Date();

  // Helper: Subtract days
  const getRelativeDate = (daysAgo: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    return date;
  };

  // Helper: Add minutes to a date
  const addMinutes = (date: Date, minutes: number) => {
    return new Date(date.getTime() + minutes * 60000);
  };

  let idCounter = 1;

  activityIds.forEach((actId) => {
    for (let i = 0; i < 10; i++) {
      // 1. TIMING STRATEGY
      const daysAgo = i * 5; 
      const startTime = getRelativeDate(daysAgo);
      
      // Fix time to 2:00 PM for consistency
      startTime.setHours(14, 0, 0, 0);

      // 2. WORK DURATION STRATEGY (Actual working time)
      let workDurationMins = 60; 
      if (actId === "1") workDurationMins = 120 + (i * 5); // Coding: ~2 hrs
      if (actId === "2") workDurationMins = 45 + (i * 2);  // Gym: ~45 mins
      if (actId === "3") workDurationMins = 90;            // Reading: 1.5 hrs
      if (actId === "4") workDurationMins = 180 - (i * 10);// Riding: ~3 hrs

      workDurationMins = Math.max(30, Math.min(180, workDurationMins));

      // 3. DETERMINE TYPE & PAUSES
      // Let's say odd indices are "manual", even are "timer"
      const isTimer = i % 2 === 0;
      const entrytype: "manual" | "timer" = isTimer ? "timer" : "manual";

      let pauseHistory: { pauseStart: Date; pauseEnd: Date }[] = [];
      let totalPauseMins = 0;

      // Add pauses ONLY if it's a timer entry and divisible by 4 (so not every record has pauses)
      if (isTimer && i % 4 === 0) {
        // Create a 15 min pause happening 30 mins after start
        const pauseStart = addMinutes(startTime, 30);
        const pauseEnd = addMinutes(pauseStart, 15);
        
        pauseHistory.push({ pauseStart, pauseEnd });
        totalPauseMins = 15;
      }

      // 4. CALCULATE END TIME
      // End Time = Start + Work Duration + Total Pause Duration
      const endTime = addMinutes(startTime, workDurationMins + totalPauseMins);

      records.push({
        _id: `r${idCounter++}`,
        activityId: actId,
        createdAt: getRelativeDate(daysAgo), // Created roughly when it started
        startTime: startTime,
        endTime: endTime,
        lastHeartbeatAt: endTime, // For completed logs, heartbeat stops at end
        entrytype: entrytype,
        status: "completed", // Historical data is always completed
        pauseHistory: pauseHistory.length > 0 ? pauseHistory : undefined
      });
    }
  });

  // Sort by Start Time (Newest First)
  return records.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
})();

export const isDevDummyEnabled = () => {
  try {
    // @ts-ignore - import.meta.env accessed safely
    const env = import.meta.env || {};
    return env.VITE_USE_DUMMY_DATA === "true" || !!env.DEV;
  } catch (e) {
    return false;
  }
};

export const getInitialActivities = (): Activity[] => {
  return isDevDummyEnabled() ? DEFAULT_ACTIVITIES : [];
};

export const getInitialRecords = (): ActivityLogEntry[] => {
  return isDevDummyEnabled() ? DEFAULT_RECORDS : [];
};
