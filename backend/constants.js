/**
 * Standard HTTP Status Codes used across the application.
 * @enum {number}
 * @readonly
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 202,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
};

export const MONGO_DB_ERRORS = {
  DUPLICATE_KEY: 11000,
};

const DEFAULT_PORT = 5001;
const FIVE_MINUTES = 5 * 60 * 1000;
const TWENTY_FOUR_HOURS = 34 * 60 * 60 * 1000;

/**
 * Global application configuration and limits.
 * @constant
 */
export const APP_CONFIG = {
  /** Default port if port not provided in .env file */
  DEFAULT_PORT: 5001,
  /** Default hex color for new activities if none provided */
  DEFAULT_ACTIVITY_COLOR: "#ffffff",
  /** Maximum allowed length of an activity name */
  MAX_ACTIVITY_NAME_LENGTH: 50,
  /** Minimum duration (in ms) required to log a valid activity (5 mins) */
  MIN_ACTIVITY_DURATION_MS: FIVE_MINUTES,
  /** Maximum duration (in ms) required to log a valid activity (24 hrs) */
  MAX_ACTIVITY_DURATION_MS: TWENTY_FOUR_HOURS,
  /** Minimum gap duration (in ms) for confirmation of recovery of a  timer entry (5 mins) */
  MIN_GAP_DURATION_FOR_CONFIRMATION_MS: FIVE_MINUTES,
  /** Maximum gap duration (in ms) for confirmation of recovery of a  timer entry (24 hrs) */
  MAX_GAP_DURATION_FOR_CONFIRMATION_MS: TWENTY_FOUR_HOURS,
  /** Maximum duration (in ms) after which revovery is not allowed (24 hrs) */
  NO_TIMER_RECOVERY_BEYOND_THIS_MS: TWENTY_FOUR_HOURS,
};
