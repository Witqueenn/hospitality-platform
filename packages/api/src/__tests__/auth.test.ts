import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import { createCallerFactory } from "../trpc";
import { authRouter } from "../routers/auth.router";

// ── Mock @repo/db ─────────────────────────────────────────────────────────────
vi.mock("@repo/db", () => ({
  db: {
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    session: {
      findUnique: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    tenant: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { db } from "@repo/db";

// ── Helpers ───────────────────────────────────────────────────────────────────

const createCaller = createCallerFactory(authRouter);

function makeCaller() {
  return createCaller({
    db,
    session: null,
    headers: new Headers(),
  });
}

const PASSWORD = "Password123!";
let PASSWORD_HASH: string;

const STORED_USER = {
  id: "user-1",
  email: "test@test.com",
  name: "Test User",
  role: "GUEST" as const,
  tenantId: "tenant-1",
  hotelId: null,
  isActive: true,
  passwordHash: "", // filled in beforeEach
};

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(async () => {
  vi.clearAllMocks();
  PASSWORD_HASH = await bcrypt.hash(PASSWORD, 12);
  STORED_USER.passwordHash = PASSWORD_HASH;
  vi.mocked(db.session.create).mockResolvedValue({
    id: "session-1",
    userId: STORED_USER.id,
    token: "mock-token-hex",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
  } as never);
  vi.mocked(db.user.update).mockResolvedValue(STORED_USER as never);
});

// ── login ─────────────────────────────────────────────────────────────────────

describe("auth.login", () => {
  it("returns user and token with valid credentials", async () => {
    vi.mocked(db.user.findFirst).mockResolvedValue(STORED_USER as never);

    const result = await makeCaller().login({
      email: "test@test.com",
      password: PASSWORD,
    });

    expect(result.user).toBeDefined();
    expect(result.user.email).toBe("test@test.com");
    expect(result.token).toBeDefined();
    expect(typeof result.token).toBe("string");
    expect(result.token.length).toBeGreaterThan(0);
  });

  it("throws UNAUTHORIZED when user does not exist", async () => {
    vi.mocked(db.user.findFirst).mockResolvedValue(null);

    await expect(
      makeCaller().login({ email: "ghost@test.com", password: PASSWORD }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws UNAUTHORIZED when password is wrong", async () => {
    vi.mocked(db.user.findFirst).mockResolvedValue(STORED_USER as never);

    await expect(
      makeCaller().login({
        email: "test@test.com",
        password: "WrongPassword!",
      }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws UNAUTHORIZED when user is inactive", async () => {
    vi.mocked(db.user.findFirst).mockResolvedValue(null); // isActive: false filtered by DB query

    await expect(
      makeCaller().login({ email: "test@test.com", password: PASSWORD }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("creates a session on successful login", async () => {
    vi.mocked(db.user.findFirst).mockResolvedValue(STORED_USER as never);

    await makeCaller().login({ email: "test@test.com", password: PASSWORD });

    expect(db.session.create).toHaveBeenCalledOnce();
    expect(db.session.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: STORED_USER.id }),
      }),
    );
  });

  it("updates lastLoginAt on successful login", async () => {
    vi.mocked(db.user.findFirst).mockResolvedValue(STORED_USER as never);

    await makeCaller().login({ email: "test@test.com", password: PASSWORD });

    expect(db.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ lastLoginAt: expect.any(Date) }),
      }),
    );
  });
});
