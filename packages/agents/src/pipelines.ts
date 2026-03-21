import type { AgentType } from "@repo/shared";

// ─────────────────────────────────────────────
// Agent Pipeline Definitions
// Maps trigger events to ordered agent sequences
// ─────────────────────────────────────────────

export const PIPELINES: Record<string, AgentType[]> = {
  // Accommodation booking flow
  "booking.search": ["MATCHMAKING", "TRUTH_TRANSPARENCY"],
  "booking.create": ["BOOKING_INTEGRITY"],
  "booking.confirmed": ["PRE_STAY_CONCIERGE"],
  "booking.checkedIn": ["STAY_SUPPORT"],

  // Support flow
  "support.case_created": ["STAY_SUPPORT", "RECOVERY_COMPENSATION"],

  // Event flow
  "event.inquiry": ["EVENT_MATCH", "VENUE_CAPACITY"],
  "event.confirmed": ["BEO_RUNOFSHOW", "FB_PLANNING"],

  // Experience
  "nightlife.booked": ["NIGHTLIFE_EXPERIENCE"],

  // Analytics (async, via BullMQ)
  "analytics.case_resolved": ["INSIGHT_HOTEL_SUCCESS"],
  "analytics.review_submitted": ["INSIGHT_HOTEL_SUCCESS"],
  "analytics.checkout_completed": ["INSIGHT_HOTEL_SUCCESS"],
};
