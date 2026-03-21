import { initTRPC, TRPCError } from "@trpc/server";
import { type FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { db } from "@repo/db";
import { ZodError } from "zod";
import type { UserRole } from "@prisma/client";

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────

export interface Session {
  userId: string;
  tenantId: string;
  role: UserRole;
  hotelId?: string;
  email: string;
  name: string;
}

export interface TRPCContext {
  db: typeof db;
  session: Session | null;
  headers: Headers;
  tenantId?: string;
}

export interface AuthedContext extends TRPCContext {
  session: Session;
  tenantId: string;
}

export async function createTRPCContext(
  opts: FetchCreateContextFnOptions,
): Promise<TRPCContext> {
  const token = opts.req.headers.get("authorization")?.replace("Bearer ", "");

  let session: Session | null = null;

  if (token) {
    const sessionRecord = await db.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (sessionRecord && sessionRecord.expiresAt > new Date()) {
      session = {
        userId: sessionRecord.user.id,
        tenantId: sessionRecord.user.tenantId,
        role: sessionRecord.user.role,
        hotelId: sessionRecord.user.hotelId ?? undefined,
        email: sessionRecord.user.email,
        name: sessionRecord.user.name,
      };
    }
  }

  return {
    db,
    session,
    headers: opts.req.headers,
  };
}

// ─────────────────────────────────────────────
// tRPC Init
// ─────────────────────────────────────────────

const t = initTRPC.context<TRPCContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────

const isAuthed = middleware(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const session: Session = ctx.session;
  return next({ ctx: { ...ctx, session } });
});

const withTenantScope = middleware(async ({ ctx, next }) => {
  // session is guaranteed non-null by isAuthed (which runs first)
  const session = ctx.session!;
  const tenantId = session.tenantId;

  // Create a scoped db client that auto-injects tenantId
  const scopedDb = ctx.db.$extends({
    query: {
      $allModels: {
        async $allOperations({
          args,
          query,
        }: {
          args: Record<string, unknown>;
          query: (args: Record<string, unknown>) => Promise<unknown>;
        }) {
          if (args["where"] && typeof args["where"] === "object") {
            (args["where"] as Record<string, unknown>)["tenantId"] = tenantId;
          }
          if (args["data"] && typeof args["data"] === "object") {
            (args["data"] as Record<string, unknown>)["tenantId"] = tenantId;
          }
          return query(args);
        },
      },
    },
  });

  return next({
    ctx: { ...ctx, session: session, db: scopedDb as typeof ctx.db, tenantId },
  });
});

export const protectedProcedure = t.procedure
  .use(isAuthed)
  .use(withTenantScope);

export function requireRole(roles: UserRole[]) {
  return middleware(({ ctx, next }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    if (!roles.includes(ctx.session.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Required role: ${roles.join(" or ")}`,
      });
    }
    return next({ ctx });
  });
}

export const createCallerFactory = t.createCallerFactory;
