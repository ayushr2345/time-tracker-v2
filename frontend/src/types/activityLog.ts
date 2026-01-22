// Types for saved time records (Activity Log entries)
export type ActivityLogEntry = {
  _id: string;
  activityId: string;
  createdAt: Date;
  startTime: Date;
  endTime: Date;
  lastHeartbeatAt: Date;
  entrytype: "manual" | "timer";
  status: "active" | "completed" | "paused";
  pauseHistory?: Array<{
    pauseStart: Date;
    pauseEnd: Date;
  }>;
  duration?: number; // in seconds
};
