// Next.js Instrumentation Hook — runs once at server startup (Node.js runtime only)
// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

import { env } from "./lib/env";

export async function register() {
  if (env.NEXT_RUNTIME === "nodejs") {
    const { setLLMClient, createLLMClient } = await import("@repo/agents");
    setLLMClient(createLLMClient());
  }
}
