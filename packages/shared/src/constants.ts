// ─────────────────────────────────────────────
// Application Constants
// ─────────────────────────────────────────────

export const APP_NAME = "Hospitality Experience Orchestration";
export const APP_SHORT_NAME = "HEO";

// Booking reference prefix
export const BOOKING_REF_PREFIX = "HEO";

// Case reference prefix
export const CASE_REF_PREFIX = "CASE";

// File upload
export const MAX_FILE_SIZE = Number(process.env["MAX_FILE_SIZE"] ?? 10485760); // 10MB
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

// Agent config
export const AGENT_CONFIDENCE_THRESHOLD = Number(
  process.env["AGENT_CONFIDENCE_THRESHOLD"] ?? 0.6,
);
export const COMPENSATION_AUTO_APPROVE_MAX_CENTS = Number(
  process.env["COMPENSATION_AUTO_APPROVE_MAX_CENTS"] ?? 2500,
);
export const REFUND_APPROVAL_THRESHOLD_CENTS = Number(
  process.env["REFUND_APPROVAL_THRESHOLD_CENTS"] ?? 10000,
);

// SLA minutes
export const SLA = {
  CRITICAL: {
    responseMinutes: Number(process.env["SLA_CRITICAL_RESPONSE_MINUTES"] ?? 15),
    resolutionMinutes: 60,
  },
  HIGH: {
    responseMinutes: Number(process.env["SLA_HIGH_RESPONSE_MINUTES"] ?? 30),
    resolutionMinutes: 240,
  },
  MEDIUM: {
    responseMinutes: Number(process.env["SLA_MEDIUM_RESPONSE_MINUTES"] ?? 120),
    resolutionMinutes: 1440,
  },
  LOW: {
    responseMinutes: Number(process.env["SLA_LOW_RESPONSE_MINUTES"] ?? 1440),
    resolutionMinutes: 4320,
  },
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Review scores
export const MIN_REVIEW_SCORE = 1;
export const MAX_REVIEW_SCORE = 10;

// No-show threshold (>= this many no-shows → flag)
export const NO_SHOW_FLAG_THRESHOLD = 2;
