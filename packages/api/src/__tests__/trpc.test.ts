import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTRPCContext } from "../trpc.js";

// ── Mock @repo/db so tests never hit a real database ─────────────────────────
vi.mock("@repo/db", () => ({
  db: {
    session: {
      findUnique: vi.fn(),
    },
  },
}));

import { db } from "@repo/db";

const mockFindUnique = vi.mocked(db.session.findUnique);

function makeRequest(headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/trpc", { headers });
}

describe("createTRPCContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null session when no authorization header", async () => {
    const ctx = await createTRPCContext({
      req: makeRequest(),
      resHeaders: new Headers(),
    });
    expect(ctx.session).toBeNull();
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("returns null session for expired token", async () => {
    mockFindUnique.mockResolvedValue({
      token: "expired-token",
      expiresAt: new Date(Date.now() - 1000), // in the past
      user: {
        id: "user-1",
        tenantId: "tenant-1",
        role: "GUEST",
        hotelId: null,
        email: "guest@example.com",
        name: "Alice",
      },
    } as never);

    const ctx = await createTRPCContext({
      req: makeRequest({ authorization: "Bearer expired-token" }),
      resHeaders: new Headers(),
    });

    expect(ctx.session).toBeNull();
  });

  it("returns valid session for active token", async () => {
    mockFindUnique.mockResolvedValue({
      token: "valid-token",
      expiresAt: new Date(Date.now() + 60_000),
      user: {
        id: "user-1",
        tenantId: "tenant-1",
        role: "GUEST",
        hotelId: null,
        email: "guest@example.com",
        name: "Alice",
      },
    } as never);

    const ctx = await createTRPCContext({
      req: makeRequest({ authorization: "Bearer valid-token" }),
      resHeaders: new Headers(),
    });

    expect(ctx.session).toMatchObject({
      userId: "user-1",
      tenantId: "tenant-1",
      role: "GUEST",
      email: "guest@example.com",
      name: "Alice",
    });
  });

  it("includes hotelId when user is hotel staff", async () => {
    mockFindUnique.mockResolvedValue({
      token: "staff-token",
      expiresAt: new Date(Date.now() + 60_000),
      user: {
        id: "user-2",
        tenantId: "tenant-1",
        role: "HOTEL_MANAGER",
        hotelId: "hotel-99",
        email: "manager@hotel.com",
        name: "Bob",
      },
    } as never);

    const ctx = await createTRPCContext({
      req: makeRequest({ authorization: "Bearer staff-token" }),
      resHeaders: new Headers(),
    });

    expect(ctx.session?.hotelId).toBe("hotel-99");
  });
});
