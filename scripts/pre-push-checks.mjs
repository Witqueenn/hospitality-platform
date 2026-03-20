#!/usr/bin/env node
/**
 * pre-push-checks.mjs
 *
 * Orchestrates all pre-push quality gates.
 * Runs sequentially — fails fast if a blocking check fails.
 *
 * Checks (in order):
 *   1. Full secrets scan (entire repo)
 *   2. Dependency consistency
 *   3. Prisma schema validation
 *   4. TypeScript type-check (all packages via turbo)
 *   5. ESLint (all packages via turbo)
 *   6. Project analysis + quality-rules.json update
 *
 * Turbo caches are used for steps 4 & 5 — subsequent pushes
 * within the same working tree are significantly faster.
 */

import { execSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve, join } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");

// ── ANSI colours ─────────────────────────────────────────────────────────────
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

// ── Timing helper ─────────────────────────────────────────────────────────────
function elapsed(start) {
  const ms = Date.now() - start;
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

// ── Run a shell command, streaming output ─────────────────────────────────────
function run(label, command, { cwd = ROOT, blocking = true, env = {} } = {}) {
  const start = Date.now();
  process.stdout.write(`  ${DIM}▶${RESET} ${label}... `);

  const result = spawnSync(command, {
    cwd,
    shell: true,
    stdio: blocking ? "pipe" : "inherit",
    encoding: "utf8",
    env: { ...process.env, ...env },
  });

  const time = elapsed(start);

  if (result.status === 0) {
    console.log(`${GREEN}✓${RESET} ${DIM}(${time})${RESET}`);
    return { ok: true, output: result.stdout ?? "" };
  } else {
    console.log(`${RED}✗${RESET} ${DIM}(${time})${RESET}`);
    if (result.stdout) console.log(result.stdout);
    if (result.stderr) console.log(result.stderr);
    return {
      ok: false,
      output: result.stdout ?? "",
      error: result.stderr ?? "",
    };
  }
}

// ── Run a Node script ─────────────────────────────────────────────────────────
function runScript(label, script, args = []) {
  return run(label, `node ${script} ${args.join(" ")}`, { cwd: ROOT });
}

// ── Section header ────────────────────────────────────────────────────────────
function section(num, title) {
  console.log(`\n${BOLD}[${num}] ${title}${RESET}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
const totalStart = Date.now();

console.log(
  `\n${BOLD}${CYAN}╔══════════════════════════════════════════════╗${RESET}`,
);
console.log(
  `${BOLD}${CYAN}║  Pre-Push Quality Gates                      ║${RESET}`,
);
console.log(
  `${BOLD}${CYAN}╚══════════════════════════════════════════════╝${RESET}`,
);
console.log(`${DIM}  Turbo cache will speed up subsequent pushes.${RESET}\n`);

const results = [];
let earlyExit = false;

// ── 1. Secrets scan ───────────────────────────────────────────────────────────
section(1, "Secrets Scan");
{
  const r = runScript(
    "Scanning repository for secrets",
    "scripts/check-secrets.mjs",
  );
  results.push({ name: "Secrets scan", ...r });
  if (!r.ok) {
    console.log(
      `\n${RED}${BOLD}Blocking: secrets detected. Remove before pushing.${RESET}`,
    );
    earlyExit = true;
  }
}

// ── 2. Dependency consistency ─────────────────────────────────────────────────
if (!earlyExit) {
  section(2, "Dependency Consistency");
  const r = runScript(
    "Checking workspace dependency consistency",
    "scripts/check-deps.mjs",
  );
  results.push({ name: "Dependency check", ...r });
  if (!r.ok) {
    console.log(
      `\n${YELLOW}Dependency issues found (see above). These won't block push, but should be fixed.${RESET}`,
    );
    // Non-blocking — dependency warnings don't prevent push
    results[results.length - 1].ok = true;
  }
}

// ── 3. Prisma schema validation ───────────────────────────────────────────────
if (!earlyExit) {
  section(3, "Prisma Schema Validation");
  const prismaSchema = join(ROOT, "packages/db/prisma/schema.prisma");

  if (existsSync(prismaSchema)) {
    const r = run(
      "Validating Prisma schema",
      "pnpm --filter @repo/db exec prisma validate",
      {
        env: {
          DATABASE_URL:
            "postgresql://dev:devpass@localhost:5432/hospitality_platform",
        },
      },
    );
    results.push({ name: "Prisma validate", ...r });
    if (!r.ok) {
      console.log(
        `\n${RED}Prisma schema is invalid. Fix schema errors before pushing.${RESET}`,
      );
      earlyExit = true;
    }
  } else {
    console.log(
      `  ${YELLOW}⚠  Prisma schema not found at ${prismaSchema}, skipping.${RESET}`,
    );
  }
}

// ── 4. TypeScript type-check ──────────────────────────────────────────────────
if (!earlyExit) {
  section(4, "TypeScript Type-Check (all packages)");
  console.log(
    `  ${DIM}Using turbo — cached results will be replayed instantly.${RESET}`,
  );

  const r = run("Running pnpm typecheck (turbo)", "pnpm typecheck");
  results.push({ name: "TypeScript typecheck", ...r });
  if (!r.ok) {
    console.log(
      `\n${RED}Type errors detected. Fix all TypeScript errors before pushing.${RESET}`,
    );
    console.log(
      `${DIM}Tip: run 'pnpm typecheck' to reproduce, or check individual packages.${RESET}`,
    );
    earlyExit = true;
  }
}

// ── 5. ESLint ─────────────────────────────────────────────────────────────────
if (!earlyExit) {
  section(5, "ESLint (all packages)");
  console.log(
    `  ${DIM}Using turbo — cached results will be replayed instantly.${RESET}`,
  );

  const r = run("Running pnpm lint (turbo)", "pnpm lint");
  results.push({ name: "ESLint", ...r });
  if (!r.ok) {
    console.log(
      `\n${RED}ESLint errors detected. Fix all lint errors before pushing.${RESET}`,
    );
    console.log(
      `${DIM}Tip: run 'pnpm lint' to reproduce. Many errors can be auto-fixed with --fix.${RESET}`,
    );
    earlyExit = true;
  }
}

// ── 6. Project analysis ───────────────────────────────────────────────────────
// Always runs — we want to keep quality-rules.json fresh regardless of other results.
section(6, "Project Analysis & Rules Update");
{
  const r = runScript(
    "Analyzing project and updating quality-rules.json",
    "scripts/analyze-project.mjs",
  );
  results.push({ name: "Project analysis", ...r });
  // Analysis findings are surfaced as recommendations, not blockers.
  // Only block if security errors found (analyze-project exits 1 in that case).
  if (!r.ok && !earlyExit) {
    console.log(
      `\n${RED}Project analysis detected critical security issues. Fix before pushing.${RESET}`,
    );
    earlyExit = true;
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────
const totalTime = elapsed(totalStart);
console.log(`\n${BOLD}${"─".repeat(50)}${RESET}`);
console.log(`${BOLD}Results:${RESET}`);

for (const { name, ok } of results) {
  const icon = ok ? `${GREEN}✓${RESET}` : `${RED}✗${RESET}`;
  console.log(`  ${icon} ${name}`);
}

console.log(`\n  Total time: ${DIM}${totalTime}${RESET}`);

const allPassed = results.every((r) => r.ok);
if (allPassed) {
  console.log(`\n${GREEN}${BOLD}All checks passed ✓${RESET}\n`);
  process.exit(0);
} else {
  console.log(`\n${RED}${BOLD}One or more checks failed ✗${RESET}\n`);
  process.exit(1);
}
