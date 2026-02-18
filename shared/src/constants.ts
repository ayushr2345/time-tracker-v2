/**
 * Base time calculations (in milliseconds).
 * Used internally to calculate readable thresholds without magic numbers.
 */
const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;

/**
 * Default ports for backend and frontend
 */
const BACKEND_PORT = 5050;
const FRONTEND_PORT = 5051;

/**
 * Standard HTTP Status Codes used across the application API.
 * Centralizing these prevents magic numbers in controllers and standardizes frontend API handling.
 */
export const HTTP_STATUS = {
  /** 200: Standard response for successful HTTP requests (e.g., GET, PUT). */
  OK: 200,
  /** 201: The request has been fulfilled, resulting in the creation of a new resource (e.g., POST). */
  CREATED: 201,
  /** 204: The server successfully processed the request and is not returning any content (e.g., DELETE). */
  NO_CONTENT: 204,
  /** 400: The server cannot process the request due to a client error (e.g., malformed request syntax or invalid data). */
  BAD_REQUEST: 400,
  /** 401: The request lacks valid authentication credentials for the target resource. */
  UNAUTHORIZED: 401,
  /** 404: The requested resource could not be found but may be available in the future. */
  NOT_FOUND: 404,
  /** 409: The request could not be completed due to a conflict with the current state of the resource (e.g., overlapping timer entries). */
  CONFLICT: 409,
  /** 500: A generic error message, given when an unexpected condition was encountered on the server. */
  SERVER_ERROR: 500,
};

/**
 * Global application limits and thresholds for the Time Tracker.
 * Shared between frontend validation and backend enforcement to ensure a single source of truth.
 */
export const APP_LIMITS = {
  /** Maximum allowed characters for an activity name to prevent UI breaking and DB bloat. */
  MAX_ACTIVITY_NAME_LENGTH: 50,

  /** The default activity color assigned if user does not provide color */
  DEFAULT_ACTIVITY_COLOR: "#6366f1",

  /** Minimum valid duration (5 minutes in milliseconds) to log an activity. Anything shorter is rejected. */
  MIN_ACTIVITY_DURATION_MS: 5 * MIN,

  /** Minimum valid duration (5 minutes) expressed in minutes. Useful for UI display or simple frontend logic. */
  MIN_ACTIVITY_DURATION_MINS: 5,

  /** Hard upper limit (24 hours in milliseconds) for a single continuous activity log. */
  MAX_ACTIVITY_DURATION_MS: 24 * HOUR,

  /** Threshold (12 hours in milliseconds) where the UI should prompt the user for confirmation before saving a manual log. */
  LONG_ACTIVITY_DURATION_MS: 12 * HOUR,

  // --- Timer Recovery Logic ---

  /** * The minimum time gap (5 minutes in milliseconds) required before the recovery logic
   * asks the user to confirm stitching a crashed timer back together.
   */
  MIN_GAP_DURATION_FOR_CONFIRMATION_MS: 5 * MIN,

  /** * The maximum time gap (24 hours in milliseconds) where timer recovery confirmation is still applicable.
   * If the gap is within this window, the user is asked what to do.
   */
  MAX_GAP_DURATION_FOR_CONFIRMATION_MS: 24 * HOUR,

  /** * The absolute cut-off point (24 hours in milliseconds). If a timer crashed and the system
   * detects it more than 24 hours later, the timer is discarded/stopped automatically without recovery.
   */
  NO_TIMER_RECOVERY_BEYOND_THIS_MS: 24 * HOUR,

  /** *
   *  Number of activity logs to show per page
   * */
  ACTIVITY_LOGS_PER_PAGE: 15,
};

/**
 * MongoDB-specific error codes to avoid hardcoding database errors in the backend controllers.
 */
export const MONGO_DB_ERRORS = {
  /** Error code 11000: Thrown by Mongoose/MongoDB when a unique index constraint is violated. */
  DUPLICATE_KEY: 11000,
};

/**
 * Default ports for frontend and backend
 */
export const DEFAULT_PORTS = {
  DEFAULT_PORT_BACKEND: BACKEND_PORT,
  DEFAULT_PORT_FRONTEND: FRONTEND_PORT,
};
