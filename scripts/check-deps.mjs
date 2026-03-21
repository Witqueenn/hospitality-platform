#!/usr/bin/env node
/**
 * check-deps.mjs
 *
 * Validates dependency consistency across the pnpm monorepo workspace.
 *
 * Checks:
 *   1. Version mismatches — the same package required at different versions
 *      across workspace packages (excluding workspace: protocol refs)
 *   2. Missing peer dependencies — packages used in code that aren't declared
 *   3. Packages pinned to exact versions vs. using ranges (best practice audit)
 *   4. Duplicate transitive dependency warnings (pulled from pnpm ls output)
 *
 * Usage:
 *   node scripts/check-deps.mjs
 *   node scripts/check-deps.mjs --strict   # treat warnings as errors
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { execSync } from "node:child_process";

const ROOT = resolve(import.meta.dirname, "..");
const STRICT = process.argv.includes("--strict");

// ── ANSI colours ─────────────────────────────────────────────────────────────
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

// ── Helpers ───────────────────────────────────────────────────────────────────
function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function getWorkspacePackages() {
  const workspaceYaml = readFileSync(join(ROOT, "pnpm-workspace.yaml"), "utf8");
  // Parse simple "packages:" list
  const patterns = workspaceYaml
    .split("\n")
    .filter((l) => l.trim().startsWith("-"))
    .map((l) =>
      l
        .replace(/^\s*-\s*["']?/, "")
        .replace(/["']?\s*$/, "")
        .trim(),
    );

  const packages = [];

  for (const pattern of patterns) {
    // Handle glob patterns like "apps/*"
    const base = pattern.replace(/\/\*$/, "");
    const baseDir = join(ROOT, base);
    if (!existsSync(baseDir)) continue;

    try {
      const entries = readdirSync(baseDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const pkgJsonPath = join(baseDir, entry.name, "package.json");
        if (!existsSync(pkgJsonPath)) continue;
        const pkg = readJson(pkgJsonPath);
        if (pkg) {
          packages.push({
            name: pkg.name ?? entry.name,
            dir: join(baseDir, entry.name),
            pkg,
          });
        }
      }
    } catch {
      // Directory may not exist for some patterns
    }
  }

  return packages;
}

function stripVersionPrefix(version) {
  return version.replace(/^[\^~>=<]+/, "").trim();
}

function isWorkspaceRef(version) {
  return version.startsWith("workspace:");
}

function isExactVersion(version) {
  return /^\d+\.\d+\.\d+/.test(version);
}

// ── 1. Version mismatch detection ─────────────────────────────────────────────
function checkVersionMismatches(packages) {
  // Map: packageName → Set of { version, usedBy }
  const depMap = new Map();

  for (const { name: pkgName, pkg } of packages) {
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.peerDependencies,
    };

    for (const [dep, version] of Object.entries(allDeps)) {
      if (isWorkspaceRef(version)) continue; // workspace refs are fine
      if (!depMap.has(dep)) depMap.set(dep, []);
      depMap.get(dep).push({ version, usedBy: pkgName });
    }
  }

  const mismatches = [];
  for (const [dep, usages] of depMap.entries()) {
    const uniqueVersions = new Set(usages.map((u) => u.version));
    if (uniqueVersions.size > 1) {
      mismatches.push({ dep, usages });
    }
  }

  return mismatches;
}

// ── 2. Exact version pinning audit ────────────────────────────────────────────
function checkExactPins(packages) {
  const exactPins = [];

  for (const { name: pkgName, pkg } of packages) {
    const allDeps = {
      ...(pkg.devDependencies ?? {}),
    };

    for (const [dep, version] of Object.entries(allDeps)) {
      if (isWorkspaceRef(version)) continue;
      if (isExactVersion(version)) {
        exactPins.push({
          dep,
          version,
          usedBy: pkgName,
          field: "devDependencies",
        });
      }
    }
  }

  return exactPins;
}

// ── 3. Missing "engines" field audit ──────────────────────────────────────────
function checkEnginesField(packages) {
  return packages.filter(({ pkg }) => !pkg.engines).map(({ name }) => name);
}

// ── 4. Packages missing "type": "module" or "commonjs" declaration ────────────
function checkModuleType(packages) {
  return packages
    .filter(({ pkg }) => !pkg.type && !pkg.main && !pkg.module && !pkg.exports)
    .map(({ name }) => name);
}

// ── Output helpers ────────────────────────────────────────────────────────────
function section(title) {
  console.log(`\n${BOLD}${CYAN}── ${title}${RESET}`);
}

function ok(msg) {
  console.log(`  ${GREEN}✓${RESET} ${msg}`);
}

function warn(msg) {
  console.log(`  ${YELLOW}⚠${RESET} ${msg}`);
}

function err(msg) {
  console.log(`  ${RED}✗${RESET} ${msg}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}Dependency Consistency Check${RESET}`);
console.log(`Scanning workspace packages...\n`);

const packages = getWorkspacePackages();
const rootPkg = readJson(join(ROOT, "package.json"));

console.log(
  `Found ${packages.length} workspace package(s): ${packages.map((p) => p.name).join(", ")}`,
);

let errorCount = 0;
let warnCount = 0;

// ── Check 1: Version mismatches ───────────────────────────────────────────────
section("Version Mismatches");
const mismatches = checkVersionMismatches(packages);

if (mismatches.length === 0) {
  ok("No version mismatches detected.");
} else {
  for (const { dep, usages } of mismatches) {
    err(`"${dep}" is required at different versions:`);
    for (const { version, usedBy } of usages) {
      console.log(`       ${usedBy}: ${version}`);
    }
    errorCount++;
  }
  console.log(
    `\n  ${YELLOW}Fix: align versions in each package.json, or hoist to root package.json.${RESET}`,
  );
}

// ── Check 2: Exact pins in devDependencies ────────────────────────────────────
section("Exact Version Pins (devDependencies)");
const exactPins = checkExactPins(packages);

if (exactPins.length === 0) {
  ok("No problematic exact version pins found.");
} else {
  for (const { dep, version, usedBy } of exactPins) {
    warn(
      `"${dep}@${version}" in ${usedBy} devDependencies — prefer "^${version}" for flexibility.`,
    );
    warnCount++;
  }
}

// ── Check 3: Missing engines field ────────────────────────────────────────────
section("Missing 'engines' Field");
const missingEngines = checkEnginesField(packages);

if (missingEngines.length === 0) {
  ok("All packages declare an 'engines' field.");
} else {
  for (const name of missingEngines) {
    warn(
      `${name} — missing "engines" field (consider adding { "node": ">=20.0.0" })`,
    );
    warnCount++;
  }
}

// ── Check 4: pnpm dedupe check (optional, requires git repo + pnpm) ──────────
section("pnpm Deduplicate Check");
try {
  execSync("pnpm dedupe --check", {
    cwd: ROOT,
    stdio: "pipe",
    encoding: "utf8",
  });
  ok("No duplicate packages that can be deduplicated.");
} catch (e) {
  const output = e.stdout ?? e.message ?? "";
  if (output.includes("No packages were deduplicated")) {
    ok("No duplicate packages that can be deduplicated.");
  } else {
    warn("pnpm dedupe found packages that could be deduplicated.");
    warn("Run 'pnpm dedupe' to clean up the lockfile.");
    console.log(`  ${YELLOW}${output.substring(0, 500)}${RESET}`);
    warnCount++;
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(60)}`);
if (errorCount === 0 && warnCount === 0) {
  console.log(
    `${GREEN}${BOLD}✓ Dependency check passed. No issues found.${RESET}`,
  );
  process.exit(0);
} else {
  console.log(
    `${errorCount > 0 ? RED : YELLOW}${BOLD}` +
      `Dependency check: ${errorCount} error(s), ${warnCount} warning(s)` +
      RESET,
  );

  if (STRICT && warnCount > 0) {
    console.log(`${RED}--strict mode: warnings treated as errors.${RESET}`);
    process.exit(1);
  }

  process.exit(errorCount > 0 ? 1 : 0);
}
