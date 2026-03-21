import { describe, it, expect } from "vitest";
import { getAgent, getAllAgents } from "../registry.js";
import type { AgentType } from "@repo/shared";

const ALL_AGENT_TYPES: AgentType[] = [
  "MATCHMAKING",
  "TRUTH_TRANSPARENCY",
  "BOOKING_INTEGRITY",
  "PRE_STAY_CONCIERGE",
  "STAY_SUPPORT",
  "RECOVERY_COMPENSATION",
  "EVENT_MATCH",
  "VENUE_CAPACITY",
  "BEO_RUNOFSHOW",
  "FB_PLANNING",
  "NIGHTLIFE_EXPERIENCE",
  "INSIGHT_HOTEL_SUCCESS",
];

describe("registry", () => {
  it("registers all 12 agent types", () => {
    expect(getAllAgents()).toHaveLength(12);
  });

  it.each(ALL_AGENT_TYPES)(
    "getAgent('%s') returns the correct agent",
    (type) => {
      const agent = getAgent(type);
      expect(agent.type).toBe(type);
      expect(typeof agent.name).toBe("string");
      expect(typeof agent.execute).toBe("function");
    },
  );

  it("throws for unknown agent type", () => {
    expect(() => getAgent("UNKNOWN" as AgentType)).toThrow(
      "Agent not found: UNKNOWN",
    );
  });
});
