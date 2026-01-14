/* DEV-ONLY fixtures and helpers
   These are intended for local development/testing only. Use the
   VITE_USE_DUMMY_DATA env var (see .env.example) to enable dummy data.
   They are safe to commit (non-secret) and are ignored in production
   by default when the env var is not set.
*/

import type { Activity } from "../types/activity";
import type { ActivityLogEntry } from "../types/activityLog";

export const DEFAULT_ACTIVITIES: Activity[] = [
  { id: "1", name: "Development", color: "#3b82f6" },
  { id: "2", name: "Design", color: "#8b5cf6" },
  { id: "3", name: "Review", color: "#ec4899" },
];

export const DEFAULT_RECORDS: ActivityLogEntry[] = [
  {
    id: "r1",
    activityId: "1",
    duration: 25 * 60,
    timestamp: Date.now() - 1000 * 60 * 60,
  },
  {
    id: "r2",
    activityId: "2",
    duration: 15 * 60,
    timestamp: Date.now() - 1000 * 60 * 40,
  },
];

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
