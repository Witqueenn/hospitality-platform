// lint-staged runs only on staged files — keeps pre-commit fast.

export default {
  // TypeScript & TSX: format only (ESLint runs in CI via turbo lint)
  "**/*.{ts,tsx}": ["prettier --write"],

  // Plain JS: just format
  "**/*.{js,mjs,cjs,jsx}": ["prettier --write"],

  // JSON, Markdown, YAML: format only
  "**/*.{json,md,yaml,yml}": ["prettier --write"],

  // Prisma schema: format
  "**/*.prisma": ["prettier --write"],

  // Shell scripts: no formatter, but ensure LF line endings
  "**/*.sh": (files) =>
    files.map(
      (f) => `node -e "
      import('node:fs').then(({readFileSync,writeFileSync}) => {
        const content = readFileSync('${f}', 'utf8');
        writeFileSync('${f}', content.replace(/\\r\\n/g, '\\n'));
      })
    "`,
    ),
};
