import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { AxiosError } from "axios";
import { HTTP_STATUS } from "@time-tracker/shared";
import { useActivities } from "./useActivities";
import { activityService } from "../../services";
import { toast } from "react-toastify";
import { MOCK_ACTIVITIES, MOCK_LOGS } from "../../test/mock";

// --- Mocks ---
vi.mock("../../services", () => ({
  activityService: {
    getAllActivities: vi.fn(),
    createActivity: vi.fn(),
    deleteActivity: vi.fn(),
    updateActivity: vi.fn(),
  },
}));

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock console.log to keep test output clean since the hook logs errors
const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

// --- Data Hydration ---
const hydratedMockActivities = MOCK_ACTIVITIES.map((activity) => ({
  ...activity,
  logCount: MOCK_LOGS.filter((log) => log.activityId === activity._id).length,
}));

// --- Helper for creating fake Axios Errors ---
const createAxiosError = (status: number, message?: string) => {
  const error = new AxiosError(message || "Axios Error");
  error.response = {
    status,
    data: message ? { message } : undefined,
  } as any;
  return error;
};

describe("useActivities Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockClear();
  });

  // ==========================================
  // 1. FETCH ACTIVITIES
  // ==========================================
  describe("fetchActivities", () => {
    it("should fetch activities on mount and set loading state (Success)", async () => {
      vi.mocked(activityService.getAllActivities).mockResolvedValueOnce(
        hydratedMockActivities,
      );
      const { result } = renderHook(() => useActivities());

      expect(result.current.loading).toBe(true);
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.activities).toEqual(hydratedMockActivities);
      expect(activityService.getAllActivities).toHaveBeenCalledTimes(1);
    });

    it("should handle fetch error", async () => {
      vi.mocked(activityService.getAllActivities).mockRejectedValueOnce(
        new Error("Network Error"),
      );
      const { result } = renderHook(() => useActivities());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(toast.error).toHaveBeenCalledWith("Failed to fetch activities");
      expect(result.current.activities).toEqual([]); // Should remain empty
    });
  });

  // ==========================================
  // 2. ADD ACTIVITY
  // ==========================================
  describe("addActivity", () => {
    beforeEach(() => {
      vi.mocked(activityService.getAllActivities).mockResolvedValueOnce(
        hydratedMockActivities,
      );
    });

    it("should handle success and append with logCount 0", async () => {
      const newActivityPayload = { name: "Meditation", color: "#FFFFFF" };
      const savedActivity = {
        _id: "6",
        ...newActivityPayload,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(activityService.createActivity).mockResolvedValueOnce(
        savedActivity as any,
      );

      const { result } = renderHook(() => useActivities());
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success;
      await act(async () => {
        success = await result.current.addActivity(newActivityPayload);
      });

      expect(success).toBe(true);
      expect(
        result.current.activities[result.current.activities.length - 1],
      ).toEqual({
        ...savedActivity,
        logCount: 0,
      });
      expect(toast.success).toHaveBeenCalledWith(
        'Activity "Meditation" created!',
      );
    });

    it("should handle HTTP 400 Bad Request error", async () => {
      vi.mocked(activityService.createActivity).mockRejectedValueOnce(
        createAxiosError(HTTP_STATUS.BAD_REQUEST),
      );
      const { result } = renderHook(() => useActivities());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const success = await act(async () =>
        result.current.addActivity({ name: "", color: "" }),
      );

      expect(success).toBe(false);
      expect(toast.error).toHaveBeenCalledWith(
        "Invalid activity data provided.",
      );
    });

    it("should handle HTTP 409 Conflict error", async () => {
      vi.mocked(activityService.createActivity).mockRejectedValueOnce(
        createAxiosError(HTTP_STATUS.CONFLICT),
      );
      const { result } = renderHook(() => useActivities());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const success = await act(async () =>
        result.current.addActivity({ name: "Coding", color: "#000" }),
      );

      expect(success).toBe(false);
      expect(toast.error).toHaveBeenCalledWith(
        "An activity with this name already exists.",
      );
    });

    it("should handle other Axios errors with backend message", async () => {
      vi.mocked(activityService.createActivity).mockRejectedValueOnce(
        createAxiosError(403, "Limit reached"),
      );
      const { result } = renderHook(() => useActivities());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const success = await act(async () =>
        result.current.addActivity({ name: "Test", color: "#000" }),
      );

      expect(success).toBe(false);
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to create activity: Limit reached",
      );
    });

    it("should handle generic Javascript errors", async () => {
      vi.mocked(activityService.createActivity).mockRejectedValueOnce(
        new Error("Unknown Failure"),
      );
      const { result } = renderHook(() => useActivities());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const success = await act(async () =>
        result.current.addActivity({ name: "Test", color: "#000" }),
      );

      expect(success).toBe(false);
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to create activity: Error: Unknown Failure",
      );
    });
  });

  // ==========================================
  // 3. DELETE ACTIVITY
  // ==========================================
  describe("deleteActivity", () => {
    const idToDelete = MOCK_ACTIVITIES[0]._id; // "1"

    beforeEach(() => {
      vi.mocked(activityService.getAllActivities).mockResolvedValueOnce(
        hydratedMockActivities,
      );
    });

    it("should handle success and remove item from state", async () => {
      vi.mocked(activityService.deleteActivity).mockResolvedValueOnce(hydratedMockActivities[0] as any);
      const { result } = renderHook(() => useActivities());
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success;
      await act(async () => {
        success = await result.current.deleteActivity(idToDelete);
      });

      expect(success).toBe(true);
      expect(result.current.activities).toHaveLength(
        hydratedMockActivities.length - 1,
      );
      expect(
        result.current.activities.find((a) => a._id === idToDelete),
      ).toBeUndefined();
      expect(toast.success).toHaveBeenCalledWith(
        "Activity deleted successfully.",
      );
    });

    it("should handle HTTP 404 Not Found error", async () => {
      vi.mocked(activityService.deleteActivity).mockRejectedValueOnce(
        createAxiosError(HTTP_STATUS.NOT_FOUND),
      );
      const { result } = renderHook(() => useActivities());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const success = await act(async () =>
        result.current.deleteActivity(idToDelete),
      );

      expect(success).toBe(false);
      expect(toast.error).toHaveBeenCalledWith(
        "Activity not found or already deleted.",
      );
    });

    it("should handle HTTP 500 Server error", async () => {
      vi.mocked(activityService.deleteActivity).mockRejectedValueOnce(
        createAxiosError(HTTP_STATUS.SERVER_ERROR),
      );
      const { result } = renderHook(() => useActivities());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const success = await act(async () =>
        result.current.deleteActivity(idToDelete),
      );

      expect(success).toBe(false);
      expect(toast.error).toHaveBeenCalledWith(
        "Error deleting activity on server.",
      );
    });

    it("should handle generic Javascript errors", async () => {
      vi.mocked(activityService.deleteActivity).mockRejectedValueOnce(
        new Error("Network disconnect"),
      );
      const { result } = renderHook(() => useActivities());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const success = await act(async () =>
        result.current.deleteActivity(idToDelete),
      );

      expect(success).toBe(false);
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to delete activity: Error: Network disconnect",
      );
    });
  });

  // ==========================================
  // 4. UPDATE ACTIVITY
  // ==========================================
  describe("updateActivity", () => {
    const idToUpdate = MOCK_ACTIVITIES[0]._id; // "1"
    const updatedPayload = { name: "Deep Work Coding", color: "#111111" };
    const updatedResponse = { ...MOCK_ACTIVITIES[0], ...updatedPayload };

    beforeEach(() => {
      vi.mocked(activityService.getAllActivities).mockResolvedValueOnce(
        hydratedMockActivities,
      );
    });

    it("should handle success and preserve existing logCount", async () => {
      vi.mocked(activityService.updateActivity).mockResolvedValueOnce(
        updatedResponse as any,
      );
      const { result } = renderHook(() => useActivities());
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success;
      await act(async () => {
        success = await result.current.updateActivity(
          idToUpdate,
          updatedPayload,
        );
      });

      expect(success).toBe(true);
      const updatedActivity = result.current.activities.find(
        (a) => a._id === idToUpdate,
      );
      expect(updatedActivity?.name).toBe("Deep Work Coding");

      const originalLogCount = hydratedMockActivities.find(
        (a) => a._id === idToUpdate,
      )?.logCount;
      expect(updatedActivity?.logCount).toBe(originalLogCount);
      expect(toast.success).toHaveBeenCalledWith(
        "Activity updated successfully.",
      );
    });

    it("should handle HTTP 404 Not Found error", async () => {
      vi.mocked(activityService.updateActivity).mockRejectedValueOnce(
        createAxiosError(HTTP_STATUS.NOT_FOUND),
      );
      const { result } = renderHook(() => useActivities());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const success = await act(async () =>
        result.current.updateActivity(idToUpdate, updatedPayload),
      );

      expect(success).toBe(false);
      expect(toast.error).toHaveBeenCalledWith("Activity not found.");
    });

    it("should handle HTTP 500 Server error", async () => {
      vi.mocked(activityService.updateActivity).mockRejectedValueOnce(
        createAxiosError(HTTP_STATUS.SERVER_ERROR),
      );
      const { result } = renderHook(() => useActivities());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const success = await act(async () =>
        result.current.updateActivity(idToUpdate, updatedPayload),
      );

      expect(success).toBe(false);
      expect(toast.error).toHaveBeenCalledWith(
        "Error updating activity on server.",
      );
    });

    it("should handle generic Javascript errors", async () => {
      vi.mocked(activityService.updateActivity).mockRejectedValueOnce(
        new Error("Crashed"),
      );
      const { result } = renderHook(() => useActivities());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const success = await act(async () =>
        result.current.updateActivity(idToUpdate, updatedPayload),
      );

      expect(success).toBe(false);
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to update activity: Error: Crashed",
      );
    });
  });
});
