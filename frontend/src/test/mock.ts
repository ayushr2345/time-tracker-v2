import type { Activity } from "../types/activity";
import type { ActivityLogEntry } from "../types/activityLog";

// --- 1. MOCK ACTIVITIES (5 Items) ---
export const MOCK_ACTIVITIES: Activity[] = [
  { _id: "1", name: "Coding", color: "#3b82f6" }, // Blue
  { _id: "2", name: "Meeting", color: "#a855f7" }, // Purple
  { _id: "3", name: "Design", color: "#ec4899" }, // Pink
  { _id: "4", name: "Workout", color: "#f97316" }, // Orange
  { _id: "5", name: "Reading", color: "#22c55e" }, // Green
];

// --- 2. MOCK LOGS (16 Items) ---
// Helper to create dates relative to "now"
const now = new Date();
const yesterday = new Date(now);
yesterday.setDate(now.getDate() - 1);
const twoDaysAgo = new Date(now);
twoDaysAgo.setDate(now.getDate() - 2);
const lastWeek = new Date(now);
lastWeek.setDate(now.getDate() - 7);

export const MOCK_LOGS: ActivityLogEntry[] = [
  // --- Activity 1: Coding (4 Logs) ---
  {
    _id: "log_1_1",
    activityId: "1",
    createdAt: lastWeek,
    startTime: new Date(lastWeek.setHours(9, 0, 0)),
    endTime: new Date(lastWeek.setHours(12, 0, 0)),
    duration: 10800, // 3 hours
    entryType: "manual",
    status: "completed",
    lastHeartbeat: new Date(lastWeek.setHours(12, 0, 0)),
  },
  {
    _id: "log_1_2",
    activityId: "1",
    createdAt: twoDaysAgo,
    startTime: new Date(twoDaysAgo.setHours(14, 0, 0)),
    endTime: new Date(twoDaysAgo.setHours(15, 30, 0)),
    duration: 5400, // 1.5 hours
    entryType: "timer",
    status: "completed",
    lastHeartbeat: new Date(twoDaysAgo.setHours(15, 30, 0)),
  },
  {
    _id: "log_1_3",
    activityId: "1",
    createdAt: yesterday,
    startTime: new Date(yesterday.setHours(10, 0, 0)),
    endTime: new Date(yesterday.setHours(11, 45, 0)),
    duration: 6300, // 1h 45m
    entryType: "timer",
    status: "completed",
    lastHeartbeat: new Date(yesterday.setHours(11, 45, 0)),
  },
  {
    _id: "log_1_4", // Currently Paused
    activityId: "1",
    createdAt: now,
    startTime: new Date(now.setHours(9, 0, 0)),
    endTime: undefined,
    duration: 1800, // 30 mins so far
    entryType: "timer",
    status: "paused",
    pauseHistory: [{ pauseTime: new Date(now.setHours(9, 30, 0)) }],
    lastHeartbeat: new Date(now.setHours(9, 30, 0)),
  },

  // --- Activity 2: Meeting (3 Logs) ---
  {
    _id: "log_2_1",
    activityId: "2",
    createdAt: lastWeek,
    startTime: new Date(lastWeek.setHours(13, 0, 0)),
    endTime: new Date(lastWeek.setHours(14, 0, 0)),
    duration: 3600, // 1 hour
    entryType: "manual",
    status: "completed",
    lastHeartbeat: new Date(lastWeek.setHours(14, 0, 0)),
  },
  {
    _id: "log_2_2",
    activityId: "2",
    createdAt: yesterday,
    startTime: new Date(yesterday.setHours(9, 30, 0)),
    endTime: new Date(yesterday.setHours(10, 0, 0)),
    duration: 1800, // 30 mins
    entryType: "timer",
    status: "completed",
    lastHeartbeat: new Date(yesterday.setHours(10, 0, 0)),
  },
  {
    _id: "log_2_3",
    activityId: "2",
    createdAt: now,
    startTime: new Date(now.setHours(11, 0, 0)),
    endTime: new Date(now.setHours(11, 45, 0)),
    duration: 2700, // 45 mins
    entryType: "timer",
    status: "completed",
    lastHeartbeat: new Date(now.setHours(11, 45, 0)),
  },

  // --- Activity 3: Design (3 Logs) ---
  {
    _id: "log_3_1",
    activityId: "3",
    createdAt: twoDaysAgo,
    startTime: new Date(twoDaysAgo.setHours(16, 0, 0)),
    endTime: new Date(twoDaysAgo.setHours(18, 0, 0)),
    duration: 7200, // 2 hours
    entryType: "manual",
    status: "completed",
    lastHeartbeat: new Date(twoDaysAgo.setHours(18, 0, 0)),
  },
  {
    _id: "log_3_2",
    activityId: "3",
    createdAt: yesterday,
    startTime: new Date(yesterday.setHours(14, 0, 0)),
    endTime: new Date(yesterday.setHours(16, 30, 0)),
    duration: 9000, // 2.5 hours
    entryType: "timer",
    status: "completed",
    lastHeartbeat: new Date(yesterday.setHours(16, 30, 0)),
  },
  {
    _id: "log_3_3", // Currently Active!
    activityId: "3",
    createdAt: now,
    startTime: new Date(now.setHours(13, 0, 0)),
    endTime: undefined, // Still running
    duration: 0, // Calculated dynamically in app
    entryType: "timer",
    status: "active",
    lastHeartbeat: new Date(),
  },

  // --- Activity 4: Workout (3 Logs) ---
  {
    _id: "log_4_1",
    activityId: "4",
    createdAt: lastWeek,
    startTime: new Date(lastWeek.setHours(7, 0, 0)),
    endTime: new Date(lastWeek.setHours(8, 0, 0)),
    duration: 3600, // 1 hour
    entryType: "manual",
    status: "completed",
    lastHeartbeat: new Date(lastWeek.setHours(8, 0, 0)),
  },
  {
    _id: "log_4_2",
    activityId: "4",
    createdAt: twoDaysAgo,
    startTime: new Date(twoDaysAgo.setHours(18, 30, 0)),
    endTime: new Date(twoDaysAgo.setHours(19, 30, 0)),
    duration: 3600, // 1 hour
    entryType: "timer",
    status: "completed",
    lastHeartbeat: new Date(twoDaysAgo.setHours(19, 30, 0)),
  },
  {
    _id: "log_4_3",
    activityId: "4",
    createdAt: yesterday,
    startTime: new Date(yesterday.setHours(7, 0, 0)),
    endTime: new Date(yesterday.setHours(8, 15, 0)),
    duration: 4500, // 1h 15m
    entryType: "timer",
    status: "completed",
    lastHeartbeat: new Date(yesterday.setHours(8, 15, 0)),
  },

  // --- Activity 5: Reading (3 Logs) ---
  {
    _id: "log_5_1",
    activityId: "5",
    createdAt: lastWeek,
    startTime: new Date(lastWeek.setHours(21, 0, 0)),
    endTime: new Date(lastWeek.setHours(21, 45, 0)),
    duration: 2700, // 45 mins
    entryType: "manual",
    status: "completed",
    lastHeartbeat: new Date(lastWeek.setHours(21, 45, 0)),
  },
  {
    _id: "log_5_2",
    activityId: "5",
    createdAt: twoDaysAgo,
    startTime: new Date(twoDaysAgo.setHours(22, 0, 0)),
    endTime: new Date(twoDaysAgo.setHours(22, 30, 0)),
    duration: 1800, // 30 mins
    entryType: "manual",
    status: "completed",
    lastHeartbeat: new Date(twoDaysAgo.setHours(22, 30, 0)),
  },
  {
    _id: "log_5_3",
    activityId: "5",
    createdAt: yesterday,
    startTime: new Date(yesterday.setHours(20, 0, 0)),
    endTime: new Date(yesterday.setHours(21, 0, 0)),
    duration: 3600, // 1 hour
    entryType: "timer",
    status: "completed",
    lastHeartbeat: new Date(yesterday.setHours(21, 0, 0)),
  },
];
