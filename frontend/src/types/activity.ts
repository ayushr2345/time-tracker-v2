/**
 * Type definitions for Activity objects.
 * @remarks
 * Represents a trackable activity in the time tracking system.
 * Each activity has a unique identifier, name, and associated color for display.
 */

/* Type definitions for activities (type-only) */
export type Activity = {
  _id: string;
  name: string;
  color: string;
};
