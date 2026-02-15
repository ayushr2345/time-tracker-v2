import { describe, it, expect } from "vitest";
import { formatDuration, formatDate, getTier } from "./utils";

/**
 * @fileoverview Unit tests for shared utility functions.
 * Tests cover time formatting, date localization, and gamified tier calculation.
 */

describe("Utility Functions", () => {
  /**
   * Tests for the duration formatting logic.
   * Verifies that the system correctly switches between 'm s' and 'h m'
   * formats based on the magnitude of the input.
   */
  describe("formatDuration", () => {
    it("returns '0s' for 0 seconds", () => {
      expect(formatDuration(0)).toBe("0s");
    });

    it("formats seconds correctly (< 1 minute)", () => {
      expect(formatDuration(45)).toBe("0m 45s");
    });

    it("formats minutes and seconds correctly (< 1 hour)", () => {
      expect(formatDuration(125)).toBe("2m 5s");
    });

    it("formats hours and minutes correctly (> 1 hour)", () => {
      expect(formatDuration(3665)).toBe("1h 1m");
    });
  });

  /**
   * Tests for the gamification tier system.
   * Verifies that the correct visual label and color classes are returned
   * based on the duration of an activity log.
   */
  describe("getTier", () => {
    it("returns WARMUP tier for short durations", () => {
      const result = getTier(100);
      expect(result.label).toBe("WARMUP");
      expect(result.color).toBe("text-gray-400");
    });

    it("returns FOCUSED tier for > 1 hour", () => {
      const result = getTier(3600);
      expect(result.label).toBe("FOCUSED");
      expect(result.color).toBe("text-emerald-400");
    });

    it("returns IN THE ZONE tier for > 2 hours", () => {
      const result = getTier(7201);
      expect(result.label).toBe("IN THE ZONE");
      expect(result.color).toBe("text-cyan-400");
    });

    it("returns ON FIRE tier for > 4 hours", () => {
      const result = getTier(14401);
      expect(result.label).toBe("ON FIRE");
      expect(result.color).toBe("text-orange-500");
    });

    it("returns GOD TIER for > 10 hours", () => {
      const result = getTier(36000);
      expect(result.label).toBe("GOD TIER");
      expect(result.color).toBe("text-yellow-400");
    });
  });

  /**
   * Tests for date formatting.
   * @remarks
   * Since `toLocaleString` output can vary slightly based on the testing environment's
   * locale settings, we test for inclusion of key components (Month, Day, Time).
   */
  describe("formatDate", () => {
    it("returns 'Now' if input is empty", () => {
      // @ts-ignore - Testing defensive fallback for null/undefined inputs
      expect(formatDate(null)).toBe("Now");
    });

    it("formats a Date object correctly", () => {
      const testDate = new Date("2024-01-01T10:00:00");
      const result = formatDate(testDate);

      // Checking for substring containment to ensure cross-environment stability
      expect(result).toContain("Jan");
      expect(result).toContain("1");
      expect(result).toContain("10:00");
    });
  });
});
