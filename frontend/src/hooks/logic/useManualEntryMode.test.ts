import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useManualEntryMode } from "./useManualEntryMode";
import { toast } from "react-toastify";
import { MOCK_ACTIVITIES } from "../../test/mock";

/**
 * @fileoverview Unit tests for the useManualEntryMode hook.
 * This suite verifies form state management, time-based validation logic,
 * and the orchestration between confirmation UI and data services.
 */

// --- 1. Mocks ---

/**
 * Mocks the activity data service.
 * Provides a static list of activities to ensure validation logic
 * can find activity names for confirmation messages.
 */
vi.mock("../data/useActivities", () => ({
  useActivities: () => ({
    activities: MOCK_ACTIVITIES,
    loading: false,
  }),
}));

/**
 * Mocks the activity log data service.
 * Tracks calls to createManualLogEntry to ensure data is submitted
 * only after validation and user confirmation.
 */
const mockCreateManualLogEntry = vi.fn().mockResolvedValue(true);
vi.mock("../data/useActivityLog", () => ({
  useActivityLog: () => ({
    createManualLogEntry: mockCreateManualLogEntry,
  }),
}));

/**
 * Mocks the custom confirmation dialog hook.
 * Captures the configuration passed to the dialog to verify
 * titles, warning levels, and calculated durations.
 */
const mockConfirm = vi.fn();
vi.mock("../ui/useConfirmToast", () => ({
  useConfirm: () => ({
    confirm: mockConfirm,
  }),
}));

/**
 * Mocks the react-toastify library.
 * Used to verify that error messages are correctly triggered
 * during form validation failures.
 */
vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

describe("useManualEntryMode Hook", () => {
  /**
   * Test Setup:
   * 1. Resets all mocks to ensure test isolation.
   * 2. Freezes the system clock to a fixed point (12:00 PM)
   * to test future-date validation reliably.
   */
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-15T12:00:00"));
  });

  /**
   * @group Initialization
   */
  it("initializes with correct default values", () => {
    const { result } = renderHook(() => useManualEntryMode());

    expect(result.current.selectedDay).toBe("today");
    expect(result.current.startTime).toBe("");
    expect(result.current.endTime).toBe("");
    expect(result.current.selectedActivityId).toBe("");
    expect(result.current.activities).toEqual(MOCK_ACTIVITIES);
  });

  /**
   * @group State Management
   */
  it("updates state correctly when inputs change", () => {
    const { result } = renderHook(() => useManualEntryMode());

    act(() => {
      result.current.setStartTime("10:00");
      result.current.setEndTime("11:00");
      result.current.handleChangeDay({ target: { value: "yesterday" } } as any);
      result.current.handleChangeActivity({ target: { value: "1" } } as any);
    });

    expect(result.current.startTime).toBe("10:00");
    expect(result.current.endTime).toBe("11:00");
    expect(result.current.selectedDay).toBe("yesterday");
    expect(result.current.selectedActivityId).toBe("1");
  });

  /**
   * @group Validation Logic
   * Verifies that the hook prevents submission for invalid data states.
   */
  describe("Validation Logic", () => {
    it("fails validation if activity is not selected", () => {
      const { result } = renderHook(() => useManualEntryMode());
      act(() => {
        result.current.handleSubmitManualEntry();
      });

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining("select an activity"),
      );
      expect(mockConfirm).not.toHaveBeenCalled();
    });

    it("fails validation if start time is missing", () => {
      const { result } = renderHook(() => useManualEntryMode());
      act(() => {
        const activityId = MOCK_ACTIVITIES[0]._id;
        result.current.handleChangeActivity({
          target: { value: activityId },
        } as React.ChangeEvent<HTMLSelectElement>);
      });
      act(() => {
        result.current.setEndTime("14:00");
      });
      act(() => {
        result.current.handleSubmitManualEntry();
      });

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining("provide both start and end times"),
      );
    });

    it("fails validation if end time is missing", () => {
      const { result } = renderHook(() => useManualEntryMode());
      act(() => {
        const activityId = MOCK_ACTIVITIES[0]._id;
        result.current.handleChangeActivity({
          target: { value: activityId },
        } as React.ChangeEvent<HTMLSelectElement>);
      });
      act(() => {
        result.current.setStartTime("13:00");
      });
      act(() => {
        result.current.handleSubmitManualEntry();
      });

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining("provide both start and end times"),
      );
    });

    it("fails validation if start time is in the future", () => {
      const { result } = renderHook(() => useManualEntryMode());
      act(() => {
        const activityId = MOCK_ACTIVITIES[0]._id;
        result.current.handleChangeActivity({
          target: { value: activityId },
        } as React.ChangeEvent<HTMLSelectElement>);
      });
      act(() => {
        result.current.setStartTime("13:00"); // 1 hour past system time
        result.current.setEndTime("14:00");
      });
      act(() => {
        result.current.handleSubmitManualEntry();
      });

      expect(toast.error).toHaveBeenCalledWith(
        "Start time cannot be in the future.",
      );
    });

    it("fails validation if end time is in the future", () => {
      const { result } = renderHook(() => useManualEntryMode());
      act(() => {
        const activityId = MOCK_ACTIVITIES[0]._id;
        result.current.handleChangeActivity({
          target: { value: activityId },
        } as React.ChangeEvent<HTMLSelectElement>);
      });
      act(() => {
        result.current.setStartTime("11:00");
        result.current.setEndTime("14:00"); // 2 hours past system time
      });
      act(() => {
        result.current.handleSubmitManualEntry();
      });

      expect(toast.error).toHaveBeenCalledWith(
        "End time cannot be in the future.",
      );
    });

    it("fails validation if start time > end time", () => {
      const { result } = renderHook(() => useManualEntryMode());
      act(() => {
        const activityId = MOCK_ACTIVITIES[0]._id;
        result.current.handleChangeActivity({
          target: { value: activityId },
        } as React.ChangeEvent<HTMLSelectElement>);
      });
      act(() => {
        result.current.setStartTime("12:00");
        result.current.setEndTime("11:00"); // End before start
      });
      act(() => {
        result.current.handleSubmitManualEntry();
      });

      expect(toast.error).toHaveBeenCalledWith(
        "End time must be after start time.",
      );
    });

    it("fails validation if duration is less than minimum (5 mins)", () => {
      const { result } = renderHook(() => useManualEntryMode());
      act(() => {
        const activityId = MOCK_ACTIVITIES[0]._id;
        result.current.handleChangeActivity({
          target: { value: activityId },
        } as React.ChangeEvent<HTMLSelectElement>);
      });
      act(() => {
        result.current.setStartTime("11:00");
        result.current.setEndTime("11:04"); // 4 mins duration
      });
      act(() => {
        result.current.handleSubmitManualEntry();
      });

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining("At least 5 minutes"),
      );
    });

    // NOTE: Multi-day entry tests (duration > 24h) are currently omitted
    // as the UI logic restricts entries to a single calendar day.
  });

  /**
   * @group Submission and Confirmation
   * Verifies the successful path: Validation -> User Confirmation -> API Call -> Form Reset.
   */
  describe("Submission and Confirmation", () => {
    it("triggers confirm dialog with correct message for normal duration", () => {
      const { result } = renderHook(() => useManualEntryMode());

      act(() => {
        const activityId = MOCK_ACTIVITIES[0]._id;
        result.current.handleChangeActivity({
          target: { value: activityId },
        } as React.ChangeEvent<HTMLSelectElement>);
      });
      act(() => {
        result.current.setStartTime("09:00");
        result.current.setEndTime("11:30");
      });
      act(() => {
        result.current.handleSubmitManualEntry();
      });

      expect(mockConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Confirm Entry for Coding",
          message: expect.stringContaining("2h 30m"),
          type: "INFO",
        }),
      );
    });

    it("triggers warning and warning toast for unusually long durations", () => {
      const { result } = renderHook(() => useManualEntryMode());

      act(() => {
        const activityId = MOCK_ACTIVITIES[0]._id;
        result.current.handleChangeActivity({
          target: { value: activityId },
        } as React.ChangeEvent<HTMLSelectElement>);
      });
      act(() => {
        // Move clock to evening so a long day session is possible
        vi.setSystemTime(new Date("2026-02-15T18:00:00"));
        result.current.setStartTime("05:00");
        result.current.setEndTime("17:30"); // 12.5 hours
      });
      act(() => {
        result.current.handleSubmitManualEntry();
      });

      expect(toast.warning).toHaveBeenCalledWith(
        "Logging high duration. Please confirm",
      );
      expect(mockConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "WARNING",
          message: expect.stringContaining("unusually long"),
        }),
      );
    });

    it("resets form only after a successful server response", async () => {
      const { result } = renderHook(() => useManualEntryMode());

      act(() => {
        const activityId = MOCK_ACTIVITIES[0]._id;
        result.current.handleChangeActivity({
          target: { value: activityId },
        } as React.ChangeEvent<HTMLSelectElement>);
      });
      act(() => {
        result.current.setStartTime("09:00");
        result.current.setEndTime("11:30");
      });
      act(() => {
        result.current.handleSubmitManualEntry();
      });

      // Manually trigger the 'onConfirm' callback from the captured confirm call
      const onConfirmCallback = mockConfirm.mock.calls[0][0].onConfirm;

      await act(async () => {
        await onConfirmCallback();
      });

      expect(mockCreateManualLogEntry).toHaveBeenCalled();
      // Verify states are reset to defaults
      expect(result.current.selectedActivityId).toBe("");
      expect(result.current.startTime).toBe("");
      expect(result.current.endTime).toBe("");
    });
  });
});
