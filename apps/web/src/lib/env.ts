export const env = {
  NEXT_RUNTIME: process.env.NEXT_RUNTIME as "nodejs" | "edge" | undefined,
} as const;
