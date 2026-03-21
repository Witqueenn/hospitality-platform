import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // ── Environment ───────────────────────────────────────────────────────────
    environment: "node",

    // ── Global test helpers (describe/it/expect without imports) ──────────────
    globals: true,

    // ── Coverage ──────────────────────────────────────────────────────────────
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/*.d.ts",
        "**/*.config.*",
        "**/generated/**", // Prisma generated files
        "**/index.ts", // Re-export barrels
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },

    // ── File matching ─────────────────────────────────────────────────────────
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/e2e/**"],

    // ── Setup files run before each test file ─────────────────────────────────
    setupFiles: [],

    // ── Timeouts ──────────────────────────────────────────────────────────────
    testTimeout: 10_000,
    hookTimeout: 10_000,

    // ── Reporting ─────────────────────────────────────────────────────────────
    reporters: process.env["CI"] ? ["verbose", "github-actions"] : ["verbose"],

    // ── Environment variables available in all tests ───────────────────────────
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://dev:devpass@localhost:5432/heo_test",
      REDIS_URL: "redis://localhost:6379/1", // DB 1 = isolated test db
      NEXTAUTH_SECRET: "test-secret-32-chars-minimum-here",
      ENCRYPTION_KEY: "a".repeat(64), // 32-byte AES-256 hex key
      AGENT_CONFIDENCE_THRESHOLD: "0.6",
      COMPENSATION_AUTO_APPROVE_MAX_CENTS: "2500",
      REFUND_APPROVAL_THRESHOLD_CENTS: "10000",
      SLA_CRITICAL_RESPONSE_MINUTES: "15",
      SLA_HIGH_RESPONSE_MINUTES: "30",
      SLA_MEDIUM_RESPONSE_MINUTES: "120",
    },
  },
});
