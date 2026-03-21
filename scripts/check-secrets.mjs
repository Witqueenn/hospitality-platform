#!/usr/bin/env node
/**
 * check-secrets.mjs
 *
 * Scans files for accidentally committed secrets, API keys, credentials,
 * and other sensitive data patterns.
 *
 * Usage:
 *   node scripts/check-secrets.mjs            # scan entire repo
 *   node scripts/check-secrets.mjs --staged   # scan only git-staged files
 */

import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve, relative } from "node:path";

// ── ANSI colours ────────────────────────────────────────────────────────────
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const GREEN = "\x1b[32m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

// ── Secret patterns ──────────────────────────────────────────────────────────
// Each entry: { name, regex, severity: "error"|"warn" }
const SECRET_PATTERNS = [
  // Generic high-entropy secrets
  {
    name: "Generic API Key",
    regex: /(?:api[_-]?key|apikey)\s*[:=]\s*["']?[A-Za-z0-9+/]{20,}["']?/gi,
    severity: "error",
  },
  {
    name: "Generic Secret",
    regex: /(?:secret|password|passwd|pwd)\s*[:=]\s*["'][^"']{8,}["']/gi,
    severity: "error",
  },

  // AWS
  {
    name: "AWS Access Key ID",
    regex: /AKIA[0-9A-Z]{16}/g,
    severity: "error",
  },
  {
    name: "AWS Secret Access Key",
    regex:
      /(?:aws[_-]?secret|aws[_-]?access)\s*[:=]\s*["']?[A-Za-z0-9+/]{40}["']?/gi,
    severity: "error",
  },

  // Private keys
  {
    name: "PEM Private Key",
    regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g,
    severity: "error",
  },
  {
    name: "PEM Certificate",
    regex: /-----BEGIN CERTIFICATE-----/g,
    severity: "warn",
  },

  // Tokens
  {
    name: "GitHub Token",
    regex: /ghp_[A-Za-z0-9]{36}/g,
    severity: "error",
  },
  {
    name: "GitHub OAuth Token",
    regex: /gho_[A-Za-z0-9]{36}/g,
    severity: "error",
  },
  {
    name: "GitHub App Token",
    regex:
      /(?:github[_-]?token|gh[_-]?token)\s*[:=]\s*["']?[A-Za-z0-9_-]{35,}["']?/gi,
    severity: "error",
  },
  {
    name: "Slack Token",
    regex: /xox[baprs]-[0-9]{10,}-[0-9]{10,}-[A-Za-z0-9]{24}/g,
    severity: "error",
  },
  {
    name: "Stripe Secret Key",
    regex: /sk_live_[A-Za-z0-9]{24,}/g,
    severity: "error",
  },
  {
    name: "Stripe Publishable Key (live)",
    regex: /pk_live_[A-Za-z0-9]{24,}/g,
    severity: "warn",
  },
  {
    name: "Twilio Auth Token",
    regex: /(?:twilio[_-]?auth[_-]?token)\s*[:=]\s*["']?[A-Za-z0-9]{32}["']?/gi,
    severity: "error",
  },
  {
    name: "SendGrid API Key",
    regex: /SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}/g,
    severity: "error",
  },
  {
    name: "JWT Secret (hardcoded)",
    regex:
      /(?:jwt[_-]?secret|nextauth[_-]?secret)\s*[:=]\s*["'][^"']{16,}["']/gi,
    severity: "error",
  },

  // Database connection strings with embedded credentials
  {
    name: "Database URL with credentials",
    regex:
      /(?:postgresql|postgres|mysql|mongodb|redis):\/\/[^:]+:[^@]{4,}@(?!localhost|127\.0\.0\.1|host\.docker\.internal)/gi,
    severity: "error",
  },

  // Hardcoded .env-style assignments in non-.env files
  {
    name: "Hardcoded env assignment",
    regex:
      /^(?:DATABASE_URL|REDIS_URL|NEXTAUTH_SECRET|ENCRYPTION_KEY)\s*=\s*["']?[^\s$][^\s]{7,}/gm,
    severity: "warn", // warn because .env files are expected; only an issue in .ts/.js
  },
];

// ── Files / patterns to always skip ─────────────────────────────────────────
const SKIP_PATTERNS = [
  /node_modules/,
  /\.git\//,
  /pnpm-lock\.yaml$/,
  /package-lock\.json$/,
  /yarn\.lock$/,
  /\.env\.example$/, // example files are fine
  /\.env\.test$/,
  /check-secrets\.mjs$/, // don't flag our own patterns
  /quality-rules\.json$/,
  /\.claude\//, // agent documentation files
  /\.agents\//, // marketing skill files
  /\.github\/workflows\//, // CI env vars are intentionally mock values
  /\.(test|spec)\.(ts|tsx|js|mjs)$/, // test files use fake credentials by design
  /__tests__\//, // test directories
  /HOSPITALITY_PLATFORM_SPEC\.md$/, // spec doc with intentional placeholder examples
  /\.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|otf|pdf|zip|tar|gz)$/i,
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function shouldSkip(filePath) {
  return SKIP_PATTERNS.some((p) => p.test(filePath));
}

function getStagedFiles() {
  try {
    const output = execSync("git diff --cached --name-only --diff-filter=ACM", {
      encoding: "utf8",
    });
    return output.trim().split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

function getAllTrackedFiles() {
  try {
    const output = execSync("git ls-files", { encoding: "utf8" });
    return output.trim().split("\n").filter(Boolean);
  } catch {
    // Fallback: just scan common source dirs if not a git repo yet
    return [];
  }
}

function scanFile(filePath) {
  const abs = resolve(filePath);
  if (!existsSync(abs)) return [];

  let content;
  try {
    content = readFileSync(abs, "utf8");
  } catch {
    return []; // binary or unreadable file
  }

  const findings = [];

  for (const { name, regex, severity } of SECRET_PATTERNS) {
    // Reset lastIndex for global regexes
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const lineNum = content.substring(0, match.index).split("\n").length;
      const lineContent = content.split("\n")[lineNum - 1].trim();

      // Skip test/mock values that are obviously fake
      if (
        /test|mock|fake|example|placeholder|your[_-]?key|xxx|dummy|sample|change[_-]?me|ci[_-]?mock|secure_password|password123/i.test(
          lineContent,
        )
      ) {
        continue;
      }

      // Skip lines using environment variable substitution (e.g. ${POSTGRES_PASSWORD})
      if (/\$\{[^}]+\}/.test(lineContent)) {
        continue;
      }

      findings.push({ name, severity, lineNum, lineContent, filePath });
    }
  }

  return findings;
}

// ── Main ─────────────────────────────────────────────────────────────────────
const stagedOnly = process.argv.includes("--staged");
const files = stagedOnly ? getStagedFiles() : getAllTrackedFiles();

const filesToScan = files.filter((f) => !shouldSkip(f));

if (filesToScan.length === 0 && stagedOnly) {
  console.log(`${GREEN}✓ No staged files to scan.${RESET}`);
  process.exit(0);
}

const allFindings = [];
for (const file of filesToScan) {
  const findings = scanFile(file);
  allFindings.push(...findings);
}

const errors = allFindings.filter((f) => f.severity === "error");
const warnings = allFindings.filter((f) => f.severity === "warn");

if (allFindings.length === 0) {
  console.log(
    `${GREEN}✓ Secrets scan: no sensitive data detected in ${filesToScan.length} file(s).${RESET}`,
  );
  process.exit(0);
}

// Print findings
if (warnings.length > 0) {
  console.log(
    `\n${YELLOW}${BOLD}⚠ Secrets scan — WARNINGS (${warnings.length}):${RESET}`,
  );
  for (const { name, filePath, lineNum, lineContent } of warnings) {
    console.log(`  ${YELLOW}[WARN]${RESET} ${name}`);
    console.log(`         ${filePath}:${lineNum}`);
    console.log(`         ${lineContent.substring(0, 120)}`);
  }
}

if (errors.length > 0) {
  console.log(
    `\n${RED}${BOLD}✗ Secrets scan — ERRORS (${errors.length}):${RESET}`,
  );
  for (const { name, filePath, lineNum, lineContent } of errors) {
    console.log(`  ${RED}[ERROR]${RESET} ${name}`);
    console.log(`          ${filePath}:${lineNum}`);
    console.log(`          ${lineContent.substring(0, 120)}`);
  }
  console.log(
    `\n${RED}Remove or move sensitive values to .env.local (which is gitignored) before committing.${RESET}`,
  );
  process.exit(1);
}

// Warnings only — exit 0 so commit proceeds, but user sees the warnings
process.exit(0);
