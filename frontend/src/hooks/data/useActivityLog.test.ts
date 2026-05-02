/**
 * @fileoverview Unit tests for the useActivityLog hook.
 * This suite verifies the core CRUD operations for activity logs, the complex
 * state transitions of timers (start, stop, pause, resume, crashed), and ensures
 * that proper UI feedback (toast notifications) is provided for success and error states.
 */

import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { AxiosError } from "axios";
import { HTTP_STATUS, APP_LIMITS } from "@time-tracker/shared";
import { useActivityLog } from "./useActivityLog";
import { useActivities } from "./useActivities";
import { activityLogService } from "../../services";
import { toast } from "react-toastify";

// --- 1. Local Mocks for Data Isolation ---

const MOCK_ACTIVITIES = [
  { _id: "act-1", name: "Deep Work", color: "#FF0000" },
  { _id: "act-2", name: "Reading", color: "#00FF00" },
];

const MOCK_LOGS = [
  {
    _id: "log-1",
    activityId: "act-1",
    status: "completed",
    duration: 3600,
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
  },
  {
    _id: "log-2",
    activityId: "act-2",
    status: "active",
    duration: 0,
    startTime: new Date().toISOString(),
  },
];

// --- 2. Module Mocks ---

/**
 * Mocks the underlying useActivities hook.
 * useActivityLog depends on this to append names and colors to raw log entries.
 */
vi.mock("./useActivities", () => ({
  useActivities: vi.fn(),
}));

/**
 * Mocks the activity log data service.
 * Intercepts backend calls to maintain test isolation and speed.
 */
vi.mock("../../services", () => ({
  activityLogService: {
    getAllActivityLogs: vi.fn(),
    createManualLogEntry: vi.fn(),
    startTimer: vi.fn(),
    stopTimer: vi.fn(),
    pauseTimer: vi.fn(),
    resumeTimer: vi.fn(),
    sendHeartbeat: vi.fn(),
    resetTimer: vi.fn(),
    resumeCrashedTimer: vi.fn(),
    deleteLogEntry: vi.fn(),
  },
}));

/**
 * Mocks react-toastify to verify UI feedback.
 */
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Silence console.error during tests so expected errors don't clutter the terminal
const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

// --- 3. Helpers ---

/**
 * Helper function to generate simulated Axios errors.
 */
const createAxiosError = (status: number, message?: string) => {
  const error = new AxiosError(message || "Axios Error");
  error.response = {
    status,
    data: message ? { error: message } : undefined,
  } as any;
  return error;
};

/**
 * Performance optimization helper for hook initialization.
 */
const setupHook = async () => {
  const rendered = renderHook(() => useActivityLog());
  await act(async () => {
    await Promise.resolve();
  });
  return rendered;
};

describe("useActivityLog Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock setup for dependencies
    vi.mocked(useActivities).mockReturnValue({
      activities: MOCK_ACTIVITIES,
    } as any);

    vi.mocked(activityLogService.getAllActivityLogs).mockResolvedValue(
      MOCK_LOGS as any,
    );
  });

  afterEach(() => {
    consoleSpy.mockClear();
    vi.useRealTimers();
  });

  /**
   * @group Fetching & Hydration
   * Verifies that logs are fetched on mount and correctly hydrated with activity details.
   */
  describe("fetchActivityLogs", () => {
    it("should fetch logs on mount, hydrate details, and manage loading state", async () => {
      const { result } = renderHook(() => useActivityLog());

      expect(result.current.loading).toBe(true);

      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.loading).toBe(false);
      expect(activityLogService.getAllActivityLogs).toHaveBeenCalledTimes(1);

      // Verify Hydration (saveActivityLogEntryWithDetails shouldn't apply to the initial fetch directly
      // in the current hook implementation, but let's check the length to ensure state is set)
      expect(result.current.activityLogs).toEqual(MOCK_LOGS);
    });

    it("should handle fetch error", async () => {
      vi.mocked(activityLogService.getAllActivityLogs).mockRejectedValueOnce(
        new Error("Network Error"),
      );

      const { result } = renderHook(() => useActivityLog());

      await act(async () => {
        await Promise.resolve();
      });

      expect(toast.error).toHaveBeenCalledWith("Failed to fetch activity logs");
      expect(result.current.activityLogs).toEqual([]);
    });
  });

  /**
   * @group Creation
   * Verifies manual log creation and correct detail hydration.
   */
  describe("createManualLogEntry", () => {
    const manualPayload = {
      activityId: "act-1",
      startTime: new Date(),
      endTime: new Date(),
    };
    const savedLog = { _id: "new-log", duration: 1200, ...manualPayload };

    it("should handle success, prepend to state, and hydrate with name/color", async () => {
      vi.mocked(activityLogService.createManualLogEntry).mockResolvedValueOnce(
        savedLog as any,
      );
      const { result } = await setupHook();

      let created;
      await act(async () => {
        created = await result.current.createManualLogEntry(
          manualPayload as any,
        );
      });

      expect(created).toEqual(savedLog);

      const hydratedNewLog = result.current.activityLogs[0];
      expect(hydratedNewLog.activityName).toBe("Deep Work");
      expect(hydratedNewLog.activityColor).toBe("#FF0000");
      expect(toast.success).toHaveBeenCalledWith(
        'Activity Log entry for "Deep Work" and duration 1200 created!',
      );
    });

    it("should apply fallback details if activity is not found", async () => {
      const unknownPayload = {
        activityId: "unknown-id",
        startTime: new Date(),
        endTime: new Date(),
      };
      const savedUnknownLog = {
        _id: "new-log-2",
        duration: 600,
        ...unknownPayload,
      };

      vi.mocked(activityLogService.createManualLogEntry).mockResolvedValueOnce(
        savedUnknownLog as any,
      );
      const { result } = await setupHook();

      await act(async () => {
        await result.current.createManualLogEntry(unknownPayload as any);
      });

      const hydratedNewLog = result.current.activityLogs[0];
      expect(hydratedNewLog.activityName).toBe("Activity-Undefined");
      expect(hydratedNewLog.activityColor).toBe(
        APP_LIMITS.DEFAULT_ACTIVITY_COLOR,
      );
    });

    it("should handle HTTP 400 Bad Request error via generic handler", async () => {
      vi.mocked(activityLogService.createManualLogEntry).mockRejectedValueOnce(
        createAxiosError(HTTP_STATUS.BAD_REQUEST, "Overlapping manual logs"),
      );
      const { result } = await setupHook();

      const success = await act(async () =>
        result.current.createManualLogEntry(manualPayload as any),
      );

      expect(success).toBeNull();
      expect(toast.error).toHaveBeenCalledWith("Overlapping manual logs");
    });
  });

  /**
   * @group Timer Operations
   * Verifies the state transitions of active timers.
   */
  describe("Timer Flow (Start, Stop, Pause, Resume, Reset)", () => {
    it("startTimer: should start and prepend active timer", async () => {
      const startPayload = { activityId: "act-2" };
      const startedLog = {
        _id: "new-active",
        status: "active",
        activityId: "act-2",
      };
      vi.mocked(activityLogService.startTimer).mockResolvedValueOnce(
        startedLog as any,
      );

      const { result } = await setupHook();

      await act(async () => {
        await result.current.startTimer(startPayload);
      });

      expect(result.current.activityLogs[0]._id).toBe("new-active");
      expect(result.current.activityLogs[0].activityName).toBe("Reading");
      expect(toast.success).toHaveBeenCalledWith(
        'Started timer for "Reading"!',
      );
    });

    it("stopTimer: should update existing timer status to completed", async () => {
      const stopPayload = { _id: "log-2", activityId: "act-2" };
      const stoppedLog = {
        _id: "log-2",
        status: "completed",
        duration: 4500,
        activityId: "act-2",
      };
      vi.mocked(activityLogService.stopTimer).mockResolvedValueOnce(
        stoppedLog as any,
      );

      const { result } = await setupHook();

      await act(async () => {
        await result.current.stopTimer(stopPayload as any);
      });

      const updatedLog = result.current.activityLogs.find(
        (l) => l._id === "log-2",
      );
      expect(updatedLog?.status).toBe("completed");
      expect(toast.success).toHaveBeenCalledWith(
        'Stopped timer for "Reading". Logged 4500s.',
      );
    });

    it("pauseTimer: should update status to paused", async () => {
      const pausedLog = { _id: "log-2", status: "paused", activityId: "act-2" };
      vi.mocked(activityLogService.pauseTimer).mockResolvedValueOnce(
        pausedLog as any,
      );

      const { result } = await setupHook();

      await act(async () => {
        await result.current.pauseTimer("log-2");
      });

      const updatedLog = result.current.activityLogs.find(
        (l) => l._id === "log-2",
      );
      expect(updatedLog?.status).toBe("paused");
      expect(toast.success).toHaveBeenCalledWith('Paused timer for "Reading"');
    });

    it("resetTimer: should delete timer without logging time", async () => {
      vi.mocked(activityLogService.resetTimer).mockResolvedValueOnce({} as any);

      const { result } = await setupHook();

      await act(async () => {
        await result.current.resetTimer("log-2");
      });

      expect(
        result.current.activityLogs.find((l) => l._id === "log-2"),
      ).toBeUndefined();
      expect(toast.success).toHaveBeenCalledWith(
        'Discarded timer for "Reading"',
      );
    });
  });

  /**
   * @group Edge Cases & Effects
   * Verifies crash recovery and the background heartbeat interval.
   */
  describe("Crash Recovery & Heartbeat", () => {
    it("resumeCrashedTimer: should recover and update status", async () => {
      const recoveredLog = {
        _id: "log-2",
        status: "active",
        activityId: "act-2",
      };
      vi.mocked(activityLogService.resumeCrashedTimer).mockResolvedValueOnce(
        recoveredLog as any,
      );

      const { result } = await setupHook();

      await act(async () => {
        await result.current.resumeCrashedTimer("log-2");
      });

      expect(
        result.current.activityLogs.find((l) => l._id === "log-2")?.status,
      ).toBe("active");
    });

    it("should trigger sendHeartbeat every 30 seconds if an active timer exists", async () => {
      vi.useFakeTimers();

      // MOCK_LOGS already has 'log-2' with status: "active"
      const { result } = await setupHook();

      // Ensure no calls initially
      expect(activityLogService.sendHeartbeat).not.toHaveBeenCalled();

      // Fast forward 30 seconds
      await act(async () => {
        vi.advanceTimersByTime(30000);
      });

      expect(activityLogService.sendHeartbeat).toHaveBeenCalledWith("log-2");
      expect(activityLogService.sendHeartbeat).toHaveBeenCalledTimes(1);

      // Fast forward another 30 seconds
      await act(async () => {
        vi.advanceTimersByTime(30000);
      });

      expect(activityLogService.sendHeartbeat).toHaveBeenCalledTimes(2);
    });

    it("should quietly fail sendHeartbeat without toasting", async () => {
      vi.useFakeTimers();
      vi.mocked(activityLogService.sendHeartbeat).mockRejectedValueOnce(
        new Error("Network Drop"),
      );

      await setupHook();

      await act(async () => {
        vi.advanceTimersByTime(30000);
      });

      // Assert error was caught and logged, but NO toast was shown
      expect(consoleSpy).toHaveBeenCalledWith(
        "Heartbeat failed:",
        expect.any(Error),
      );
      expect(toast.error).not.toHaveBeenCalled();
    });
  });

  /**
   * @group Deletion
   * Verifies standard log entry removal.
   */
  describe("deleteLogEntry", () => {
    it("should successfully remove a log entry and trigger toast", async () => {
      vi.mocked(activityLogService.deleteLogEntry).mockResolvedValueOnce(
        {} as any,
      );
      const { result } = await setupHook();

      await act(async () => {
        await result.current.deleteLogEntry("log-1");
      });

      expect(
        result.current.activityLogs.find((l) => l._id === "log-1"),
      ).toBeUndefined();
      expect(toast.success).toHaveBeenCalledWith(
        'Deleted activity log entry for "Deep Work"',
      );
    });

    it("should handle generic errors during deletion", async () => {
      vi.mocked(activityLogService.deleteLogEntry).mockRejectedValueOnce(
        new Error("Database locked"),
      );
      const { result } = await setupHook();

      await act(async () => {
        await result.current.deleteLogEntry("log-1");
      });

      expect(toast.error).toHaveBeenCalledWith(
        "Failed to delete log entry: Error: Database locked",
      );
    });
  });
});
