import express from "express";
import {
  getActivityLogs,
  createManualLogEntry,
  getActivityLogsForCustomRange,
  startTimer,
  stopTimer,
  pauseTimer,
  resumeTimer,
  sendHeartbeat,
  resetTimer,
  resumeCrashedTimer,
  deleteLogEntry,
} from "../controllers/activityLogController.js";

/**
 * Express Router for Activity Logs.
 * @remarks
 * Defines RESTful endpoints for managing time tracking sessions.
 * Handles both manual entry creation and the full lifecycle of a live timer.
 * Base path: `/api/activity-logs` (configured in app.ts).
 */
const router = express.Router();

// ============================================================================
//  Manual Log Management
// ============================================================================

/**
 * @route POST /createManualEntryLog/:id
 * @description Creates a completed log entry manually.
 * @param {string} id - The Activity ID (in URL params) to associate with this log.
 * @remarks Expects `startTime`, `endTime`, and optionally `duration` in the body.
 */
router.post("/createManualEntryLog/:id", createManualLogEntry);

/**
 * @route DELETE /deleteLogEntry/:id
 * @description Permanently removes a specific log entry.
 * @param {string} id - The unique Log ID (in URL params) to delete.
 */
router.delete("/deleteLogEntry/:id", deleteLogEntry);

// ============================================================================
//  Data Retrieval
// ============================================================================

/**
 * @route GET /getActivityLogs
 * @description Retrieves logs for the current day (default) or a standard period.
 * @remarks Useful for daily dashboards.
 */
router.get("/getActivityLogs", getActivityLogs);

/**
 * @route GET /getActivityLogsForCustomRange
 * @description Retrieves logs within a specific start and end date.
 * @query {string} from - Start date (ISO string).
 * @query {string} to - End date (ISO string).
 */
router.get("/getActivityLogsForCustomRange", getActivityLogsForCustomRange);

// ============================================================================
//  Live Timer Lifecycle
// ============================================================================

/**
 * @route POST /startTimer/:id
 * @description Starts a new active timer for an activity.
 * @param {string} id - The Activity ID (in URL params).
 * @remarks Checks if another timer is already running and stops it if necessary.
 */
router.post("/startTimer/:id", startTimer);

/**
 * @route PATCH /stopTimer/:id
 * @description Stops an active timer and finalizes the log entry.
 * @param {string} id - The Log ID (in URL params) to stop.
 * @remarks Calculates the final duration and sets status to 'completed'.
 */
router.patch("/stopTimer/:id", stopTimer);

/**
 * @route PATCH /pauseTimer/:id
 * @description Pauses a running timer.
 * @param {string} id - The Log ID (in URL params).
 * @remarks Sets status to 'paused' and records the pause timestamp.
 */
router.patch("/pauseTimer/:id", pauseTimer);

/**
 * @route PATCH /resumeTimer/:id
 * @description Resumes a paused timer.
 * @param {string} id - The Log ID (in URL params).
 * @remarks Sets status to 'active' and calculates the pause duration.
 */
router.patch("/resumeTimer/:id", resumeTimer);

/**
 * @route DELETE /resetTimer/:id
 * @description Cancels (deletes) a running or paused timer without saving.
 * @param {string} id - The Log ID (in URL params).
 * @remarks Useful if the user started a timer by mistake.
 */
router.delete("/resetTimer/:id", resetTimer);

// ============================================================================
//  System Recovery & Reliability
// ============================================================================

/**
 * @route PATCH /sendHeartbeat/:id
 * @description Updates the `lastHeartbeat` timestamp for a running timer.
 * @param {string} id - The Log ID (in URL params).
 * @remarks Called periodically by the client to prove the browser is still open.
 */
router.patch("/sendHeartbeat/:id", sendHeartbeat);

/**
 * @route PATCH /resumeCrashedTimer/:id
 * @description Recovers a timer that was interrupted (e.g., browser crash).
 * @param {string} id - The Log ID (in URL params).
 * @remarks
 * - Treats the time between the crash (last heartbeat) and now as "Paused" time.
 * - Prevents users from gaining "fake" hours if they forgot to stop a timer.
 */
router.patch("/resumeCrashedTimer/:id", resumeCrashedTimer);

export default router;
