import type { Agent, AgentType } from "@repo/shared";
import { MatchmakingAgent } from "./agents/matchmaking.agent.js";
import { TruthTransparencyAgent } from "./agents/truthTransparency.agent.js";
import { BookingIntegrityAgent } from "./agents/bookingIntegrity.agent.js";
import { PreStayConciergeAgent } from "./agents/preStayConcierge.agent.js";
import { StaySupportAgent } from "./agents/staySupport.agent.js";
import { RecoveryCompensationAgent } from "./agents/recoveryCompensation.agent.js";
import { EventMatchAgent } from "./agents/eventMatch.agent.js";
import { VenueCapacityAgent } from "./agents/venueCapacity.agent.js";
import { BEORunOfShowAgent } from "./agents/beoRunOfShow.agent.js";
import { FBPlanningAgent } from "./agents/fbPlanning.agent.js";
import { NightlifeExperienceAgent } from "./agents/nightlifeExperience.agent.js";
import { InsightHotelSuccessAgent } from "./agents/insightHotelSuccess.agent.js";

const REGISTRY = new Map<AgentType, Agent>([
  ["MATCHMAKING", new MatchmakingAgent()],
  ["TRUTH_TRANSPARENCY", new TruthTransparencyAgent()],
  ["BOOKING_INTEGRITY", new BookingIntegrityAgent()],
  ["PRE_STAY_CONCIERGE", new PreStayConciergeAgent()],
  ["STAY_SUPPORT", new StaySupportAgent()],
  ["RECOVERY_COMPENSATION", new RecoveryCompensationAgent()],
  ["EVENT_MATCH", new EventMatchAgent()],
  ["VENUE_CAPACITY", new VenueCapacityAgent()],
  ["BEO_RUNOFSHOW", new BEORunOfShowAgent()],
  ["FB_PLANNING", new FBPlanningAgent()],
  ["NIGHTLIFE_EXPERIENCE", new NightlifeExperienceAgent()],
  ["INSIGHT_HOTEL_SUCCESS", new InsightHotelSuccessAgent()],
]);

export function getAgent(type: AgentType): Agent {
  const agent = REGISTRY.get(type);
  if (!agent) throw new Error(`Agent not found: ${type}`);
  return agent;
}

export function getAllAgents(): Agent[] {
  return Array.from(REGISTRY.values());
}
