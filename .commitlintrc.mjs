/**
 * Commitlint configuration — enforces Conventional Commits format.
 *
 * Format:  <type>(<scope>): <subject>
 * Example: feat(booking): add multi-room reservation support
 *
 * Types map to semantic versioning:
 *   feat     → minor bump  (new feature)
 *   fix      → patch bump  (bug fix)
 *   chore    → no bump     (tooling, dependencies)
 *   docs     → no bump     (documentation only)
 *   refactor → no bump     (code restructure, no behavior change)
 *   perf     → patch bump  (performance improvement)
 *   test     → no bump     (adding/fixing tests)
 *   ci       → no bump     (CI/CD pipeline changes)
 *   build    → no bump     (build system changes)
 *   revert   → patch bump  (reverts a previous commit)
 */
export default {
  extends: ["@commitlint/config-conventional"],

  rules: {
    // Enforce known types only
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "chore",
        "docs",
        "refactor",
        "perf",
        "test",
        "ci",
        "build",
        "revert",
        "style",
      ],
    ],

    // Enforce known scopes (matches monorepo packages + infra areas)
    "scope-enum": [
      1, // warn, not error — allows unlisted scopes with a warning
      "always",
      [
        // apps
        "web",
        // packages
        "api",
        "agents",
        "db",
        "email",
        "queue",
        "shared",
        // tooling
        "eslint",
        "prettier",
        "tsconfig",
        // infrastructure
        "docker",
        "ci",
        "hooks",
        "deps",
        // cross-cutting
        "auth",
        "booking",
        "events",
        "hotel",
        "tenant",
        "analytics",
        "notifications",
      ],
    ],

    // Subject must start lowercase
    "subject-case": [2, "always", "lower-case"],

    // Subject must not end with a period
    "subject-full-stop": [2, "never", "."],

    // Subject must not be empty
    "subject-empty": [2, "never"],

    // Body lines max 100 chars
    "body-max-line-length": [1, "always", 100],

    // Header max 100 chars
    "header-max-length": [2, "always", 100],
  },
};
