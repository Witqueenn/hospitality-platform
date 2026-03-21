#!/usr/bin/env node
/**
 * analyze-project.mjs
 *
 * Analyzes the codebase for patterns, inconsistencies, and anti-patterns.
 * Generates / updates quality-rules.json with:
 *   - Detected patterns (what the project does consistently)
 *   - Active rules (enforced by tooling)
 *   - Violations found (things that deviate from detected patterns)
 *   - Recommendations (improvements to consider)
 *   - Metrics (file counts, complexity signals)
 *
 * Runs automatically on every pre-push. Can also be run manually:
 *   pnpm analyze
 *
 * Output: quality-rules.json (committed to repo, evolves over time)
 */

import {
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  existsSync,
} from "node:fs";
import { resolve, join, extname, relative } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const OUTPUT_FILE = join(ROOT, "quality-rules.json");

// ── ANSI colours ─────────────────────────────────────────────────────────────
const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

// ── File walker ───────────────────────────────────────────────────────────────
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  ".turbo",
  "dist",
  "build",
  "coverage",
  ".cache",
  "prisma/migrations", // generated
]);

function* walkFiles(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkFiles(full);
    } else {
      yield full;
    }
  }
}

function readSafe(filePath) {
  try {
    return readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

// ── Collectors ────────────────────────────────────────────────────────────────

function collectFileMetrics(allFiles) {
  const byExt = {};
  let totalLines = 0;
  let largestFile = { path: "", lines: 0 };

  for (const f of allFiles) {
    const ext = extname(f) || "(none)";
    byExt[ext] = (byExt[ext] ?? 0) + 1;

    const content = readSafe(f);
    const lines = content.split("\n").length;
    totalLines += lines;

    if (lines > largestFile.lines) {
      largestFile = { path: relative(ROOT, f), lines };
    }
  }

  return { byExt, totalLines, largestFile, totalFiles: allFiles.length };
}

function detectTypeScriptPatterns(tsFiles) {
  const patterns = {
    usesTypeImports: 0,
    usesAnyType: 0,
    usesTypeAssertion: 0, // "as Type"
    usesNonNullAssertion: 0, // "!"
    usesConsoleLog: 0,
    usesZodValidation: 0,
    usesTrpcProcedures: 0,
    usesPrismaClient: 0,
    usesEnvVarDirectly: 0, // process.env.XYZ outside of env.ts/config
    missingReturnTypes: 0,
    todos: [],
    fixmes: [],
  };

  const violations = [];

  for (const f of tsFiles) {
    const content = readSafe(f);
    const rel = relative(ROOT, f);
    const lines = content.split("\n");

    if (/import type /m.test(content)) patterns.usesTypeImports++;
    if (/: any(?:\b|;|,|\)|\s)/m.test(content)) {
      patterns.usesAnyType++;
      violations.push({
        file: rel,
        rule: "no-explicit-any",
        message: "Uses 'any' type — prefer explicit types or 'unknown'",
        severity: "warn",
      });
    }
    if (/ as [A-Z]\w+/m.test(content)) patterns.usesTypeAssertion++;
    if (/!\./m.test(content)) patterns.usesNonNullAssertion++;
    if (
      /console\.log\(/m.test(content) &&
      !rel.includes("seed") &&
      !rel.includes("scripts/")
    ) {
      patterns.usesConsoleLog++;
      violations.push({
        file: rel,
        rule: "no-console",
        message: "console.log() found — use a structured logger instead",
        severity: "warn",
      });
    }
    if (/from ['"]zod['"]/m.test(content)) patterns.usesZodValidation++;
    if (/\.procedure\./m.test(content) || /createTRPCRouter/m.test(content))
      patterns.usesTrpcProcedures++;
    if (/from ['"]@repo\/db['"]/m.test(content) || /prisma\./m.test(content))
      patterns.usesPrismaClient++;

    // Flag direct process.env usage outside expected config files
    if (
      /process\.env\.\w+/m.test(content) &&
      !rel.includes("env.") &&
      !rel.includes("config.") &&
      !rel.includes(".env") &&
      !rel.includes("docker")
    ) {
      patterns.usesEnvVarDirectly++;
      violations.push({
        file: rel,
        rule: "no-direct-env",
        message:
          "Direct process.env access — centralize env vars in a typed env module",
        severity: "warn",
      });
    }

    // Collect TODOs and FIXMEs with context
    lines.forEach((line, i) => {
      const todoMatch = line.match(/\/\/\s*TODO[:\s]/i);
      const fixmeMatch = line.match(/\/\/\s*FIXME[:\s]/i);
      if (todoMatch)
        patterns.todos.push({ file: rel, line: i + 1, text: line.trim() });
      if (fixmeMatch)
        patterns.fixmes.push({ file: rel, line: i + 1, text: line.trim() });
    });
  }

  return { patterns, violations };
}

function detectStructuralIssues(allFiles) {
  const issues = [];

  // Check for package.jsons missing "exports" field in library packages
  const libPackageDirs = [
    "packages/api",
    "packages/agents",
    "packages/db",
    "packages/email",
    "packages/queue",
    "packages/shared",
  ];

  for (const dir of libPackageDirs) {
    const pkgPath = join(ROOT, dir, "package.json");
    const pkg = readJson(pkgPath);
    if (pkg && !pkg.exports && !pkg.main) {
      issues.push({
        file: relative(ROOT, pkgPath),
        rule: "package-exports",
        message: `Package "${pkg.name}" missing "exports" field — consumers rely on internal paths`,
        severity: "warn",
      });
    }
  }

  // Check for .ts files that import from relative paths crossing package boundaries
  const tsFiles = allFiles.filter((f) => /\.(ts|tsx)$/.test(f));
  for (const f of tsFiles) {
    const content = readSafe(f);
    const rel = relative(ROOT, f);

    // Detect cross-package relative imports (../../packages/xxx)
    const crossPkg = content.match(
      /from ['"]\.\.\/\.\.\/\.\.\/(packages|apps)\/\w+/g,
    );
    if (crossPkg) {
      issues.push({
        file: rel,
        rule: "no-cross-package-relative-import",
        message: `Cross-package relative import detected — use workspace package name instead`,
        severity: "error",
      });
    }
  }

  return issues;
}

function detectSecurityPatterns(allFiles) {
  const issues = [];
  const tsFiles = allFiles.filter((f) => /\.(ts|tsx)$/.test(f));

  for (const f of tsFiles) {
    const content = readSafe(f);
    const rel = relative(ROOT, f);

    // eval() usage
    if (/\beval\s*\(/.test(content)) {
      issues.push({
        file: rel,
        rule: "no-eval",
        message: "eval() usage detected",
        severity: "error",
      });
    }

    // innerHTML assignment
    if (/\.innerHTML\s*=/.test(content)) {
      issues.push({
        file: rel,
        rule: "no-innerhtml",
        message: "innerHTML assignment — potential XSS vector",
        severity: "error",
      });
    }

    // dangerouslySetInnerHTML in JSX
    if (/dangerouslySetInnerHTML/.test(content)) {
      issues.push({
        file: rel,
        rule: "no-dangerously-set-inner-html",
        message: "dangerouslySetInnerHTML usage — review for XSS risk",
        severity: "warn",
      });
    }

    // SQL template literals (potential injection if not using Prisma)
    if (/\$queryRaw`|sql`/.test(content)) {
      issues.push({
        file: rel,
        rule: "raw-sql-review",
        message: "Raw SQL template literal detected — ensure parameterization",
        severity: "warn",
      });
    }
  }

  return issues;
}

function detectImportPatterns(allFiles) {
  const tsFiles = allFiles.filter((f) => /\.(ts|tsx)$/.test(f));
  const barrelFiles = tsFiles.filter(
    (f) => f.endsWith("index.ts") || f.endsWith("index.tsx"),
  );
  const inconsistencies = [];

  // Check for barrel files not exporting everything from the directory
  for (const barrel of barrelFiles) {
    const dir = barrel.replace(/\/index\.tsx?$/, "");
    let siblings;
    try {
      siblings = readdirSync(dir).filter(
        (f) => /\.(ts|tsx)$/.test(f) && !f.startsWith("index"),
      );
    } catch {
      continue;
    }

    const barrelContent = readSafe(barrel);
    const unexported = siblings.filter(
      (s) => !barrelContent.includes(s.replace(/\.tsx?$/, "")),
    );

    if (unexported.length > 0 && siblings.length > 0) {
      inconsistencies.push({
        file: relative(ROOT, barrel),
        rule: "barrel-completeness",
        message: `Barrel may be missing exports: ${unexported.slice(0, 3).join(", ")}`,
        severity: "info",
      });
    }
  }

  return inconsistencies;
}

function gatherActiveRules() {
  // Read actual eslint config to document what's enforced
  const eslintConfig = readSafe(join(ROOT, "tooling/eslint-config/base.js"));
  const prettierConfig = readSafe(
    join(ROOT, "tooling/prettier-config/index.js"),
  );

  return {
    eslint: {
      configLocation: "tooling/eslint-config/base.js",
      extends: [
        "eslint:recommended",
        "@typescript-eslint/recommended-type-checked",
        "@typescript-eslint/stylistic-type-checked",
      ],
      keyRules: [
        "no-unused-vars (error) — vars matching ^_ are exempt",
        "consistent-type-imports (warn) — prefer separate type imports",
        "no-misused-promises (error) — catches async in void contexts",
        "import/consistent-type-specifier-style (error) — top-level type imports",
      ],
    },
    prettier: {
      configLocation: "tooling/prettier-config/index.js",
      settings: {
        printWidth: 100,
        tabWidth: 2,
        semi: true,
        singleQuote: false,
        trailingComma: "all",
      },
    },
    typescript: {
      strict: true,
      configLocations: [
        "tooling/tsconfig/base.json",
        "tooling/tsconfig/library.json",
        "tooling/tsconfig/nextjs.json",
      ],
    },
    commitlint: {
      configLocation: ".commitlintrc.mjs",
      format: "<type>(<scope>): <subject>",
      enforces: "Conventional Commits",
    },
    husky: {
      hooks: {
        "pre-commit": "check-secrets + lint-staged",
        "commit-msg": "commitlint",
        "pre-push": "full check suite",
      },
    },
    lintStaged: {
      configLocation: "lint-staged.config.mjs",
      "*.{ts,tsx}": ["prettier --write", "eslint --fix"],
      "*.{js,mjs,cjs}": ["prettier --write"],
      "*.{json,md,yaml}": ["prettier --write"],
    },
  };
}

function buildRecommendations(
  metrics,
  tsPatterns,
  structuralIssues,
  securityIssues,
) {
  const recommendations = [];

  if (tsPatterns.patterns.usesAnyType > 5) {
    recommendations.push({
      id: "REC-001",
      priority: "high",
      title: "Reduce 'any' type usage",
      description: `Found ${tsPatterns.patterns.usesAnyType} files using 'any'. Enable @typescript-eslint/no-explicit-any as an error to enforce explicit types.`,
      action: "Add 'no-explicit-any: error' to tooling/eslint-config/base.js",
    });
  }

  if (tsPatterns.patterns.usesConsoleLog > 3) {
    recommendations.push({
      id: "REC-002",
      priority: "medium",
      title: "Replace console.log with structured logging",
      description: `Found ${tsPatterns.patterns.usesConsoleLog} files using console.log in source code. Use a structured logger (e.g., pino) for production-ready logging.`,
      action:
        "Add a shared logger to packages/shared and replace console.log usages.",
    });
  }

  if (tsPatterns.patterns.usesEnvVarDirectly > 2) {
    recommendations.push({
      id: "REC-003",
      priority: "medium",
      title: "Centralize environment variable access",
      description: `${tsPatterns.patterns.usesEnvVarDirectly} files access process.env directly. Centralizing env vars in a typed module (e.g., using @t3-oss/env-nextjs) prevents runtime surprises.`,
      action:
        "Create packages/shared/src/env.ts with Zod-validated env exports.",
    });
  }

  if (tsPatterns.patterns.todos.length > 10) {
    recommendations.push({
      id: "REC-004",
      priority: "low",
      title: "Address accumulated TODOs",
      description: `Found ${tsPatterns.patterns.todos.length} TODO comments across the codebase. Consider tracking these as GitHub Issues instead.`,
      action: "Review and convert TODOs to GitHub Issues or resolve them.",
    });
  }

  if (securityIssues.length > 0) {
    recommendations.push({
      id: "REC-005",
      priority: "critical",
      title: "Address security findings",
      description: `${securityIssues.length} potential security issue(s) detected (see violations).`,
      action: "Review each finding in the violations section and remediate.",
    });
  }

  if (
    !existsSync(join(ROOT, "vitest.config.ts")) &&
    !existsSync(join(ROOT, "jest.config.ts"))
  ) {
    recommendations.push({
      id: "REC-006",
      priority: "high",
      title: "Add test infrastructure",
      description:
        "No test runner config detected (vitest or jest). Testing is critical for a production platform.",
      action: "Set up Vitest for unit tests and Playwright for E2E tests.",
    });
  }

  if (!existsSync(join(ROOT, ".github/workflows"))) {
    recommendations.push({
      id: "REC-007",
      priority: "high",
      title: "Add CI/CD pipeline",
      description:
        "No GitHub Actions workflows found. Automate lint, typecheck, and tests on PRs.",
      action:
        "Create .github/workflows/ci.yml with lint + typecheck + test jobs.",
    });
  }

  return recommendations;
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}${CYAN}Project Analyzer${RESET} — scanning codebase...`);

const allFiles = [...walkFiles(ROOT)];
const tsFiles = allFiles.filter((f) => /\.(ts|tsx)$/.test(f));

console.log(
  `  Scanned ${allFiles.length} files (${tsFiles.length} TypeScript files)`,
);

const metrics = collectFileMetrics(allFiles);
const tsAnalysis = detectTypeScriptPatterns(tsFiles);
const structuralIssues = detectStructuralIssues(allFiles);
const securityIssues = detectSecurityPatterns(allFiles);
const importIssues = detectImportPatterns(allFiles);
const activeRules = gatherActiveRules();
const recommendations = buildRecommendations(
  metrics,
  tsAnalysis,
  structuralIssues,
  securityIssues,
);

// ── Load existing rules to preserve history ───────────────────────────────────
const existing = existsSync(OUTPUT_FILE) ? readJson(OUTPUT_FILE) : {};
const runHistory = existing.runHistory ?? [];
runHistory.push(new Date().toISOString());
// Keep last 20 run timestamps
if (runHistory.length > 20) runHistory.shift();

// ── Build output ──────────────────────────────────────────────────────────────
const allViolations = [
  ...tsAnalysis.violations,
  ...structuralIssues,
  ...securityIssues,
  ...importIssues,
];

const output = {
  $schema: "./quality-rules.schema.json",
  meta: {
    generatedAt: new Date().toISOString(),
    generatedBy: "scripts/analyze-project.mjs",
    version: "1.0.0",
    description:
      "Auto-generated quality rules and codebase analysis. Do not edit manually — re-run `pnpm analyze` to regenerate.",
    runHistory,
  },

  metrics: {
    totalFiles: metrics.totalFiles,
    totalLines: metrics.totalLines,
    largestFile: metrics.largestFile,
    byExtension: metrics.byExt,
    typeScriptCoverage: {
      tsFiles: tsFiles.length,
      percentage: Math.round((tsFiles.length / allFiles.length) * 100),
    },
  },

  detectedPatterns: {
    description: "Patterns consistently used in this codebase",
    patterns: [
      {
        id: "PAT-001",
        name: "Type-safe API layer",
        detected: tsAnalysis.patterns.usesTrpcProcedures > 0,
        description: "tRPC procedures used for all API communication",
      },
      {
        id: "PAT-002",
        name: "Zod runtime validation",
        detected: tsAnalysis.patterns.usesZodValidation > 0,
        description: "Zod schemas used for input validation",
      },
      {
        id: "PAT-003",
        name: "Prisma ORM",
        detected: tsAnalysis.patterns.usesPrismaClient > 0,
        description: "Prisma used for all database access",
      },
      {
        id: "PAT-004",
        name: "Consistent type imports",
        detected: tsAnalysis.patterns.usesTypeImports > 0,
        description: "'import type' used for type-only imports",
      },
      {
        id: "PAT-005",
        name: "Monorepo package boundaries",
        detected: true,
        description:
          "Code organized into discrete workspace packages with clear ownership",
      },
    ],
  },

  activeRules,

  violations: {
    summary: {
      total: allViolations.length,
      errors: allViolations.filter((v) => v.severity === "error").length,
      warnings: allViolations.filter((v) => v.severity === "warn").length,
      info: allViolations.filter((v) => v.severity === "info").length,
    },
    items: allViolations,
  },

  codeQualitySignals: {
    todos: {
      count: tsAnalysis.patterns.todos.length,
      items: tsAnalysis.patterns.todos.slice(0, 20), // cap output size
    },
    fixmes: {
      count: tsAnalysis.patterns.fixmes.length,
      items: tsAnalysis.patterns.fixmes.slice(0, 10),
    },
    anyTypeUsage: tsAnalysis.patterns.usesAnyType,
    nonNullAssertions: tsAnalysis.patterns.usesNonNullAssertion,
    consoleLogUsage: tsAnalysis.patterns.usesConsoleLog,
  },

  recommendations,
};

// ── Write output ──────────────────────────────────────────────────────────────
writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2) + "\n");

// ── Print summary ─────────────────────────────────────────────────────────────
const errCount = allViolations.filter((v) => v.severity === "error").length;
const warnCount = allViolations.filter((v) => v.severity === "warn").length;

console.log(`\n  ${GREEN}✓ quality-rules.json updated${RESET}`);
console.log(`  Violations: ${errCount} error(s), ${warnCount} warning(s)`);
console.log(`  Recommendations: ${recommendations.length}`);

if (recommendations.length > 0) {
  const critical = recommendations.filter((r) => r.priority === "critical");
  const high = recommendations.filter((r) => r.priority === "high");
  if (critical.length > 0) {
    console.log(`\n  ${BOLD}Critical recommendations:${RESET}`);
    for (const r of critical) {
      console.log(`    ⚠  ${r.title}: ${r.action}`);
    }
  }
  if (high.length > 0) {
    console.log(`\n  ${BOLD}High-priority recommendations:${RESET}`);
    for (const r of high) {
      console.log(`    →  ${r.title}`);
    }
  }
}

console.log(`\n  Full report: quality-rules.json\n`);

// Exit non-zero if security errors found
if (errCount > 0) {
  process.exit(1);
}
