import { describe, it, expect, vi, beforeEach } from "vitest";
import { BookingIntegrityAgent } from "../agents/bookingIntegrity.agent.js";
import { RecoveryCompensationAgent } from "../agents/recoveryCompensation.agent.js";
import { StaySupportAgent } from "../agents/staySupport.agent.js";
import { InsightHotelSuccessAgent } from "../agents/insightHotelSuccess.agent.js";
import { VenueCapacityAgent } from "../agents/venueCapacity.agent.js";
import type { AgentInput } from "@repo/shared";

// ── Mock @repo/db (VenueCapacityAgent hits the DB directly) ──────────────────
vi.mock("@repo/db", () => ({
  db: {
    venue: { findMany: vi.fn() },
  },
}));

import { db } from "@repo/db";

// ── Shared fixtures ───────────────────────────────────────────────────────────

const GUEST = { id: "guest-1", name: "Alice", preferences: {}, noShowCount: 0 };
const HOTEL = {
  id: "hotel-1",
  name: "Grand Hotel",
  amenities: [],
  averageReviewScore: 8,
};

const EMPTY_HISTORY = {
  previousCases: [],
  compensationHistory: [],
  bookingHistory: [],
};

function input(
  overrides: Partial<AgentInput["context"]> = {},
  payload: AgentInput["payload"] = {},
): AgentInput {
  return {
    context: {
      guest: GUEST,
      hotel: HOTEL,
      history: EMPTY_HISTORY,
      ...overrides,
    },
    payload,
  };
}

// ── BookingIntegrityAgent ─────────────────────────────────────────────────────

describe("BookingIntegrityAgent", () => {
  const agent = new BookingIntegrityAgent();

  it("returns PROCEED with high confidence when no risks", async () => {
    const result = await agent.execute(
      input(
        {},
        {
          checkIn: "2027-01-10",
          checkOut: "2027-01-12",
          availableCount: 5,
        },
      ),
    );

    expect(result.decision).toMatch(/^PROCEED/);
    expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    expect(result.escalate).toBe(false);
  });

  it("returns BLOCK and escalates when check-out is before check-in", async () => {
    const result = await agent.execute(
      input(
        {},
        {
          checkIn: "2027-01-12",
          checkOut: "2027-01-10",
        },
      ),
    );

    expect(result.decision).toMatch(/^BLOCK/);
    expect(result.escalate).toBe(true);
  });

  it("returns BLOCK when check-in date is in the past", async () => {
    const result = await agent.execute(
      input(
        {},
        {
          checkIn: "2020-01-01",
          checkOut: "2020-01-03",
        },
      ),
    );

    expect(result.decision).toMatch(/^BLOCK/);
    expect(result.escalate).toBe(true);
  });

  it("returns FLAG when availability is low but dates are valid", async () => {
    const result = await agent.execute(
      input(
        {},
        {
          checkIn: "2027-06-01",
          checkOut: "2027-06-03",
          availableCount: 1,
        },
      ),
    );

    expect(result.decision).toMatch(/^FLAG/);
    expect(result.escalate).toBe(false);
    expect(result.actions).toHaveLength(1);
    expect(result.actions[0]?.type).toBe("flag_booking_risk");
  });

  it("flags guests with no-show history", async () => {
    const result = await agent.execute(
      input(
        { guest: { ...GUEST, noShowCount: 3 } },
        {
          checkIn: "2027-06-01",
          checkOut: "2027-06-03",
        },
      ),
    );

    const meta = result.metadata as Record<string, unknown>;
    const risks = meta["risks"] as string[];
    expect(risks.some((r) => r.includes("no-show"))).toBe(true);
  });
});

// ── RecoveryCompensationAgent ─────────────────────────────────────────────────

describe("RecoveryCompensationAgent", () => {
  const agent = new RecoveryCompensationAgent();

  const severities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

  it.each(severities)(
    "returns a decision for severity %s",
    async (severity) => {
      const result = await agent.execute(
        input({
          case: { id: "case-1", severity, category: "OTHER" },
          history: EMPTY_HISTORY,
        }),
      );

      expect(result.decision).toBeDefined();
      expect(result.agentType).toBe("RECOVERY_COMPENSATION");
    },
  );

  it("auto-approves LOW severity compensation", async () => {
    const result = await agent.execute(
      input({
        case: { id: "case-1", severity: "LOW", category: "WIFI_ISSUE" },
        history: EMPTY_HISTORY,
      }),
    );

    const meta = result.metadata as Record<string, unknown>;
    expect(meta["requiresApproval"]).toBe(false);
    expect(result.decision).not.toContain("requires approval");
  });

  it("requires approval for HIGH severity", async () => {
    const result = await agent.execute(
      input({
        case: { id: "case-1", severity: "HIGH", category: "AC_BROKEN" },
        history: EMPTY_HISTORY,
      }),
    );

    const meta = result.metadata as Record<string, unknown>;
    expect(meta["requiresApproval"]).toBe(true);
    expect(result.decision).toContain("requires approval");
  });

  it("escalates when guest lifetime compensation exceeds $500", async () => {
    const result = await agent.execute(
      input({
        case: { id: "case-1", severity: "MEDIUM", category: "OTHER" },
        history: {
          ...EMPTY_HISTORY,
          compensationHistory: [{ valueCents: 30000 }, { valueCents: 25000 }],
        },
      }),
    );

    expect(result.escalate).toBe(true);
    expect(result.decision).toContain("limit reached");
  });
});

// ── StaySupportAgent ──────────────────────────────────────────────────────────

describe("StaySupportAgent", () => {
  const agent = new StaySupportAgent();

  it("returns a decision with SLA metadata", async () => {
    const result = await agent.execute(
      input({
        case: {
          id: "case-1",
          category: "ROOM_CLEANLINESS",
          severity: "MEDIUM",
        },
      }),
    );

    expect(result.decision).toBeDefined();
    const meta = result.metadata as Record<string, unknown>;
    expect(meta["severity"]).toBe("MEDIUM");
    expect(meta["responseDeadline"]).toBeInstanceOf(Date);
    expect(meta["resolutionDeadline"]).toBeInstanceOf(Date);
  });

  it("escalates SAFETY_CONCERN cases", async () => {
    const result = await agent.execute(
      input({
        case: {
          id: "case-1",
          category: "SAFETY_CONCERN",
          severity: "CRITICAL",
        },
      }),
    );

    expect(result.escalate).toBe(true);
    expect(result.agentType).toBe("STAY_SUPPORT");
  });

  it("maps WIFI_ISSUE to LOW severity", async () => {
    const result = await agent.execute(
      input({
        case: { id: "case-1", category: "WIFI_ISSUE", severity: "LOW" },
      }),
    );

    const meta = result.metadata as Record<string, unknown>;
    expect(meta["severity"]).toBe("LOW");
    expect(result.escalate).toBe(false);
  });

  it("creates send_notification action when guest and hotel are present", async () => {
    const result = await agent.execute(
      input({
        case: { id: "case-1", category: "CHECK_IN_DELAY", severity: "MEDIUM" },
      }),
    );

    const notify = result.actions.find((a) => a.type === "send_notification");
    expect(notify).toBeDefined();
    expect(notify?.requiresApproval).toBe(false);
  });
});

// ── InsightHotelSuccessAgent ──────────────────────────────────────────────────

describe("InsightHotelSuccessAgent", () => {
  const agent = new InsightHotelSuccessAgent();

  it("returns low-confidence no-op when hotel context is missing", async () => {
    const result = await agent.execute(input({ hotel: undefined }));

    expect(result.confidence).toBe(0.5);
    expect(result.actions).toHaveLength(0);
  });

  it("detects recurring issues at 3+ cases of the same category", async () => {
    const result = await agent.execute(
      input({
        history: {
          ...EMPTY_HISTORY,
          previousCases: [
            { category: "WIFI_ISSUE" },
            { category: "WIFI_ISSUE" },
            { category: "WIFI_ISSUE" },
          ],
        },
      }),
    );

    const meta = result.metadata as Record<string, unknown>;
    const insights = meta["insights"] as string[];
    expect(insights.some((i) => i.includes("WIFI_ISSUE"))).toBe(true);
    expect(result.actions).toHaveLength(1);
    expect(result.actions[0]?.type).toBe("create_insight");
  });

  it("does not flag categories with fewer than 3 cases", async () => {
    const result = await agent.execute(
      input({
        history: {
          ...EMPTY_HISTORY,
          previousCases: [
            { category: "NOISE_COMPLAINT" },
            { category: "NOISE_COMPLAINT" },
          ],
        },
      }),
    );

    expect(result.actions).toHaveLength(0);
  });

  it("flags high average compensation", async () => {
    const result = await agent.execute(
      input({
        history: {
          ...EMPTY_HISTORY,
          compensationHistory: [{ valueCents: 6000 }, { valueCents: 7000 }],
        },
      }),
    );

    const meta = result.metadata as Record<string, unknown>;
    const insights = meta["insights"] as string[];
    expect(insights.some((i) => i.includes("compensation"))).toBe(true);
  });
});

// ── VenueCapacityAgent ────────────────────────────────────────────────────────

describe("VenueCapacityAgent", () => {
  const agent = new VenueCapacityAgent();

  beforeEach(() => vi.clearAllMocks());

  const EVENT_REQUEST = {
    id: "event-1",
    guestCount: 50,
    eventType: "CONFERENCE",
  };

  it("returns low-confidence when context is missing", async () => {
    const result = await agent.execute(input({ eventRequest: undefined }));

    expect(result.confidence).toBe(0.5);
    expect(db.venue.findMany).not.toHaveBeenCalled();
  });

  it("finds suitable venues and returns their count", async () => {
    vi.mocked(db.venue.findMany).mockResolvedValue([
      {
        id: "v-1",
        name: "Ballroom",
        capacities: { banquet: 100, theatre: 150 },
        isActive: true,
      },
      {
        id: "v-2",
        name: "Boardroom",
        capacities: { boardroom: 20 },
        isActive: true,
      },
    ] as never);

    const result = await agent.execute(input({ eventRequest: EVENT_REQUEST }));

    // Ballroom fits 50 guests, Boardroom does not
    expect(result.decision).toContain("1 suitable venue");
    expect(result.escalate).toBe(false);
  });

  it("escalates when no venue can fit the guest count", async () => {
    vi.mocked(db.venue.findMany).mockResolvedValue([
      {
        id: "v-1",
        name: "Boardroom",
        capacities: { boardroom: 10 },
        isActive: true,
      },
    ] as never);

    const result = await agent.execute(input({ eventRequest: EVENT_REQUEST }));

    expect(result.escalate).toBe(true);
    expect(result.decision).toContain("No suitable venues");
  });
});
