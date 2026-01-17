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

export const DEFAULT_RECORDS: ActivityLogEntry[] = [
  {
    _id: "r1",
    activityId: "2",
    createdAt: new Date(),
    isActive: false,
    startTime: new Date(Date.now() - 1000 * 60 * 60),
    endTime: new Date(Date.now() - 1000 * 60 * 45),
    lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    _id: "r2",
    activityId: "2",
    createdAt: new Date(),
    isActive: false,
    startTime: new Date(Date.now() - 1000 * 60 * 45),
    endTime: new Date(Date.now() - 1000 * 60 * 35),
    lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 35),
  },
{
    _id: "r3",
    activityId: "1",
    createdAt: new Date(),
    isActive: false,
    startTime: new Date(Date.now() - 1000 * 60 * 120),
    endTime: new Date(Date.now() - 1000 * 60 * 90),
    lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 90),
},
{
    _id: "r4",
    activityId: "1",
    createdAt: new Date(),
    isActive: false,
    startTime: new Date(Date.now() - 1000 * 60 * 90),
    endTime: new Date(Date.now() - 1000 * 60 * 60),
    lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 60),
},
{
    _id: "r5",
    activityId: "1",
    createdAt: new Date(),
    isActive: false,
    startTime: new Date(Date.now() - 1000 * 60 * 180),
    endTime: new Date(Date.now() - 1000 * 60 * 120),
    lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 120),
},
{
    _id: "r6",
    activityId: "1",
    createdAt: new Date(),
    isActive: false,
    startTime: new Date(Date.now() - 1000 * 60 * 150),
    endTime: new Date(Date.now() - 1000 * 60 * 100),
    lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 100),
},
{
    _id: "r7",
    activityId: "1",
    createdAt: new Date(),
    isActive: false,
    startTime: new Date(Date.now() - 1000 * 60 * 110),
    endTime: new Date(Date.now() - 1000 * 60 * 65),
    lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 65),
},
{
    _id: "r8",
    activityId: "1",
    createdAt: new Date(),
    isActive: false,
    startTime: new Date(Date.now() - 1000 * 60 * 95),
    endTime: new Date(Date.now() - 1000 * 60 * 55),
    lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 55),
},
{
    _id: "r9",
    activityId: "1",
    createdAt: new Date(),
    isActive: false,
    startTime: new Date(Date.now() - 1000 * 60 * 140),
    endTime: new Date(Date.now() - 1000 * 60 * 80),
    lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 80),
},
{
    _id: "r10",
    activityId: "1",
    createdAt: new Date(),
    isActive: false,
    startTime: new Date(Date.now() - 1000 * 60 * 160),
    endTime: new Date(Date.now() - 1000 * 60 * 100),
    lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 100),
},
{
    _id: "r11",
    activityId: "1",
    createdAt: new Date(),
    isActive: false,
    startTime: new Date(Date.now() - 1000 * 60 * 130),
    endTime: new Date(Date.now() - 1000 * 60 * 70),
    lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 70),
},
{
    _id: "r12",
    activityId: "1",
    createdAt: new Date(),
    isActive: false,
    startTime: new Date(Date.now() - 1000 * 60 * 175),
    endTime: new Date(Date.now() - 1000 * 60 * 115),
    lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 115),
},
{
    _id: "r13",
    activityId: "3",
    createdAt: new Date(),
    isActive: false,
    startTime: new Date(Date.now() - 1000 * 60 * 100),
    endTime: new Date(Date.now() - 1000 * 60 * 70),
    lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 70),
},
{
    _id: "r14",
    activityId: "3",
    createdAt: new Date(),
    isActive: false,
    startTime: new Date(Date.now() - 1000 * 60 * 120),
    endTime: new Date(Date.now() - 1000 * 60 * 75),
    lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 75),
},
{
    _id: "r15",
    activityId: "3",
    createdAt: new Date(),
    isActive: false,
    startTime: new Date(Date.now() - 1000 * 60 * 90),
    endTime: new Date(Date.now() - 1000 * 60 * 60),
    lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 60),
},
{
    _id: "r16",
    activityId: "3",
    createdAt: new Date(),
    isActive: false,
    startTime: new Date(Date.now() - 1000 * 60 * 110),
    endTime: new Date(Date.now() - 1000 * 60 * 50),
    lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 50),
},
{
    _id: "r17",
    activityId: "3",
    createdAt: new Date(),
    isActive: false,
    startTime: new Date(Date.now() - 1000 * 60 * 150),
    endTime: new Date(Date.now() - 1000 * 60 * 90),
    lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 90),
},
{
    _id: "r18",
    activityId: "3",
    createdAt: new Date(),
    isActive: false,
    startTime: new Date(Date.now() - 1000 * 60 * 80),
    endTime: new Date(Date.now() - 1000 * 60 * 40),
    lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 40),
},
{
    _id: "r19",
    activityId: "3",
    createdAt: new Date(),
    isActive: false,
    startTime: new Date(Date.now() - 1000 * 60 * 130),
    endTime: new Date(Date.now() - 1000 * 60 * 80),
    lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 80),
},
{
    _id: "r20",
    activityId: "3",
    createdAt: new Date(),
    isActive: false,
    startTime: new Date(Date.now() - 1000 * 60 * 170),
    endTime: new Date(Date.now() - 1000 * 60 * 100),
    lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 100),
},
{
    _id: "r21",
    activityId: "3",
    createdAt: new Date(),
    isActive: false,
    startTime: new Date(Date.now() - 1000 * 60 * 95),
    endTime: new Date(Date.now() - 1000 * 60 * 65),
    lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 65),
},
{
    _id: "r22",
    activityId: "3",
    createdAt: new Date(),
    isActive: false,
    startTime: new Date(Date.now() - 1000 * 60 * 140),
    endTime: new Date(Date.now() - 1000 * 60 * 95),
    lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 95),
},
{
    _id: "r23",
    activityId: "4",
    createdAt: new Date(),
    isActive: false,
    startTime: new Date(Date.now() - 1000 * 60 * 60),
    endTime: new Date(Date.now() - 1000 * 60 * 30),
    lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 30),
},
{
    _id: "r24",
    activityId: "4",
    createdAt: new Date(),
    isActive: false,
    startTime: new Date(Date.now() - 1000 * 60 * 120),
    endTime: new Date(Date.now() - 1000 * 60 * 60),
    lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 60),
},
{
    _id: "r25",
    activityId: "4",
    createdAt: new Date(),
    isActive: false,
    startTime: new Date(Date.now() - 1000 * 60 * 90),
    endTime: new Date(Date.now() - 1000 * 60 * 45),
    lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 45),
},
{
    _id: "r26",
    activityId: "4",
    createdAt: new Date(),
    isActive: false,
    startTime: new Date(Date.now() - 1000 * 60 * 150),
    endTime: new Date(Date.now() - 1000 * 60 * 75),
    lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 75),
},
{
    _id: "r27",
    activityId: "4",
    createdAt: new Date(),
    isActive: false,
    startTime: new Date(Date.now() - 1000 * 60 * 110),
    endTime: new Date(Date.now() - 1000 * 60 * 55),
    lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 55),
},
{
    _id: "r28",
    activityId: "4",
    createdAt: new Date(),
    isActive: false,
    startTime: new Date(Date.now() - 1000 * 60 * 75),
    endTime: new Date(Date.now() - 1000 * 60 * 35),
    lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 35),
},
{
    _id: "r29",
    activityId: "4",
    createdAt: new Date(),
    isActive: false,
    startTime: new Date(Date.now() - 1000 * 60 * 140),
    endTime: new Date(Date.now() - 1000 * 60 * 85),
    lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 85),
},
{
    _id: "r30",
    activityId: "4",
    createdAt: new Date(),
    isActive: false,
    startTime: new Date(Date.now() - 1000 * 60 * 160),
    endTime: new Date(Date.now() - 1000 * 60 * 100),
    lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 100),
},
{
    _id: "r31",
    activityId: "4",
    createdAt: new Date(),
    isActive: false,
    startTime: new Date(Date.now() - 1000 * 60 * 100),
    endTime: new Date(Date.now() - 1000 * 60 * 50),
    lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 50),
},
{
    _id: "r32",
    activityId: "4",
    createdAt: new Date(),
    isActive: false,
    startTime: new Date(Date.now() - 1000 * 60 * 130),
    endTime: new Date(Date.now() - 1000 * 60 * 70),
    lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 70),
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
