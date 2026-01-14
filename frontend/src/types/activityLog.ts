// Types for saved time records (Activity Log entries)
export type ActivityLogEntry = {
  id: string;
  activityId: string;
  duration: number; // seconds
  timestamp: number; // epoch ms
};
