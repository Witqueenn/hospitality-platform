// ─────────────────────────────────────────────
// Agent System Types
// ─────────────────────────────────────────────

export type AgentType =
  | "MATCHMAKING"
  | "TRUTH_TRANSPARENCY"
  | "BOOKING_INTEGRITY"
  | "PRE_STAY_CONCIERGE"
  | "STAY_SUPPORT"
  | "RECOVERY_COMPENSATION"
  | "EVENT_MATCH"
  | "VENUE_CAPACITY"
  | "BEO_RUNOFSHOW"
  | "FB_PLANNING"
  | "NIGHTLIFE_EXPERIENCE"
  | "INSIGHT_HOTEL_SUCCESS";

export interface GuestProfile {
  id: string;
  name: string;
  email: string;
  preferences: Record<string, unknown>;
  totalBookings: number;
  noShowCount: number;
  averageRating?: number;
  vipStatus?: boolean;
}

export interface HotelProfile {
  id: string;
  name: string;
  starRating?: number;
  amenities: string[];
  policies: Record<string, unknown>;
  wifiQuality?: string;
  noiseNotes?: string;
  averageReviewScore?: number;
  transparencyScore?: number;
}

export interface BookingDetails {
  id: string;
  bookingRef: string;
  hotelId: string;
  checkIn?: Date;
  checkOut?: Date;
  guestCount: number;
  totalCents: number;
  status: string;
}

export interface SupportCaseDetails {
  id: string;
  caseRef: string;
  category: string;
  severity: string;
  status: string;
  description: string;
  roomNumber?: string;
  createdAt: Date;
}

export interface EventRequestDetails {
  id: string;
  eventType: string;
  title: string;
  eventDate: Date;
  startTime?: string;
  endTime?: string;
  guestCount: number;
  budgetCents?: number;
  requirements: Record<string, unknown>;
}

export type PolicyMap = Record<string, unknown>;

export interface SupportCaseSummary {
  id: string;
  category: string;
  severity: string;
  status: string;
  resolvedAt?: Date;
  compensationTotal?: number;
}

export interface CompensationSummary {
  type: string;
  valueCents?: number;
  status: string;
  createdAt: Date;
}

export interface BookingSummary {
  id: string;
  status: string;
  totalCents: number;
  checkIn?: Date;
  checkOut?: Date;
}

export interface AgentDecisionSummary {
  agentType: AgentType;
  decision: string;
  confidence: number;
  createdAt: Date;
}

export interface AgentContext {
  tenantId: string;
  sessionId: string;
  guest?: GuestProfile;
  hotel?: HotelProfile;
  booking?: BookingDetails;
  case?: SupportCaseDetails;
  eventRequest?: EventRequestDetails;
  policies: PolicyMap;
  history: {
    previousCases: SupportCaseSummary[];
    compensationHistory: CompensationSummary[];
    bookingHistory: BookingSummary[];
    agentDecisions: AgentDecisionSummary[];
  };
}

export interface AgentInput {
  context: AgentContext;
  triggerEvent: string;
  payload: Record<string, unknown>;
}

export interface AgentAction {
  type: string;
  payload: Record<string, unknown>;
  requiresApproval: boolean;
  priority: "immediate" | "normal" | "low";
}

export interface AgentOutput {
  agentType: AgentType;
  decision: string;
  reasoning: string;
  confidence: number; // 0.0 - 1.0
  actions: AgentAction[];
  escalate: boolean;
  escalationReason?: string;
  metadata?: Record<string, unknown>;
}

export interface Agent {
  type: AgentType;
  name: string;
  description: string;
  execute(input: AgentInput): Promise<AgentOutput>;
}
