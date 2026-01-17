// Types for saved time records (Activity Log entries)
export type ActivityLogEntry = {
  _id: string;
  activityId: string;
  createdAt: Date;
  isActive: boolean;
  startTime: Date;
  endTime: Date;
  lastHeartbeatAt: Date;

  // to be removed later; kept for backward compatibility
//   duration: number; // seconds
};
