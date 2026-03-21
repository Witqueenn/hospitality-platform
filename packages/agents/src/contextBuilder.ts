import { db } from "@repo/db";
import type {
  AgentContext,
  GuestProfile,
  HotelProfile,
  PolicyMap,
} from "@repo/shared";

export async function buildContext(
  tenantId: string,
  payload: Record<string, unknown>,
): Promise<Omit<AgentContext, "policies" | "history" | "sessionId">> {
  const context: Omit<AgentContext, "policies" | "history" | "sessionId"> = {
    tenantId,
  };

  // Load guest
  if (typeof payload["guestId"] === "string") {
    const user = await db.user.findUnique({
      where: { id: payload["guestId"] },
      include: {
        bookings: {
          select: {
            id: true,
            status: true,
            totalCents: true,
            checkIn: true,
            checkOut: true,
          },
        },
      },
    });

    if (user) {
      const noShowCount = user.bookings.filter(
        (b) => b.status === "NO_SHOW",
      ).length;

      context.guest = {
        id: user.id,
        name: user.name,
        email: user.email,
        preferences: user.preferences as Record<string, unknown>,
        totalBookings: user.bookings.length,
        noShowCount,
      } satisfies GuestProfile;
    }
  }

  // Load hotel
  if (typeof payload["hotelId"] === "string") {
    const hotel = await db.hotel.findUnique({
      where: { id: payload["hotelId"] },
    });

    if (hotel) {
      const reviews = await db.review.findMany({
        where: { hotelId: hotel.id, moderationStatus: "APPROVED" },
        select: { overallScore: true },
      });

      const avgScore =
        reviews.length > 0
          ? reviews.reduce((s, r) => s + r.overallScore, 0) / reviews.length
          : undefined;

      context.hotel = {
        id: hotel.id,
        name: hotel.name,
        starRating: hotel.starRating ?? undefined,
        amenities: hotel.amenities as string[],
        policies: hotel.policies as Record<string, unknown>,
        wifiQuality: hotel.wifiQuality ?? undefined,
        noiseNotes: hotel.noiseNotes ?? undefined,
        averageReviewScore: avgScore,
      } satisfies HotelProfile;
    }
  }

  // Load booking
  if (typeof payload["bookingId"] === "string") {
    const booking = await db.booking.findUnique({
      where: { id: payload["bookingId"] },
    });
    if (booking) {
      context.booking = {
        id: booking.id,
        bookingRef: booking.bookingRef,
        hotelId: booking.hotelId,
        checkIn: booking.checkIn ?? undefined,
        checkOut: booking.checkOut ?? undefined,
        guestCount: booking.guestCount,
        totalCents: booking.totalCents,
        status: booking.status,
      };
    }
  }

  // Load support case
  if (typeof payload["caseId"] === "string") {
    const supportCase = await db.supportCase.findUnique({
      where: { id: payload["caseId"] },
    });
    if (supportCase) {
      context.case = {
        id: supportCase.id,
        caseRef: supportCase.caseRef,
        category: supportCase.category,
        severity: supportCase.severity,
        status: supportCase.status,
        description: supportCase.description,
        roomNumber: supportCase.roomNumber ?? undefined,
        createdAt: supportCase.createdAt,
      };
    }
  }

  return context;
}

export async function loadHistory(
  context: Pick<AgentContext, "guest" | "hotel">,
): Promise<AgentContext["history"]> {
  const guestId = context.guest?.id;
  const hotelId = context.hotel?.id;

  const [previousCases, compensationHistory, bookingHistory, agentDecisions] =
    await Promise.all([
      guestId
        ? db.supportCase.findMany({
            where: { guestId },
            select: {
              id: true,
              category: true,
              severity: true,
              status: true,
              resolvedAt: true,
              compensations: { select: { valueCents: true, status: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          })
        : [],

      guestId
        ? db.compensationAction.findMany({
            where: { supportCase: { guestId } },
            select: {
              compensationType: true,
              valueCents: true,
              status: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          })
        : [],

      guestId
        ? db.booking.findMany({
            where: { guestId },
            select: {
              id: true,
              status: true,
              totalCents: true,
              checkIn: true,
              checkOut: true,
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          })
        : [],

      hotelId
        ? db.agentExecutionLog.findMany({
            where: { supportCase: { hotelId } },
            select: {
              agentType: true,
              decisionSummary: true,
              confidenceScore: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 5,
          })
        : [],
    ]);

  return {
    previousCases: previousCases.map((c) => ({
      id: c.id,
      category: c.category,
      severity: c.severity,
      status: c.status,
      resolvedAt: c.resolvedAt ?? undefined,
      compensationTotal: c.compensations.reduce(
        (s, comp) => s + (comp.valueCents ?? 0),
        0,
      ),
    })),
    compensationHistory: compensationHistory.map((c) => ({
      type: c.compensationType,
      valueCents: c.valueCents ?? undefined,
      status: c.status,
      createdAt: c.createdAt,
    })),
    bookingHistory: bookingHistory.map((b) => ({
      id: b.id,
      status: b.status,
      totalCents: b.totalCents,
      checkIn: b.checkIn ?? undefined,
      checkOut: b.checkOut ?? undefined,
    })),
    agentDecisions: agentDecisions.map((a) => ({
      agentType: a.agentType,
      decision: a.decisionSummary,
      confidence: a.confidenceScore ? Number(a.confidenceScore) : 0.5,
      createdAt: a.createdAt,
    })),
  };
}

export async function loadPolicies(tenantId: string): Promise<PolicyMap> {
  const policies = await db.tenantPolicy.findMany({ where: { tenantId } });
  return Object.fromEntries(policies.map((p) => [p.policyKey, p.policyValue]));
}
