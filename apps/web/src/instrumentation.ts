// Next.js Instrumentation Hook — runs once at server startup (Node.js runtime only)
// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { setLLMClient, createLLMClient } = await import("@repo/agents");
      setLLMClient(createLLMClient());
    } catch (e) {
      // Agents package not yet compiled — LLM client will initialize lazily on first use
      console.warn(
        "[HEO] Agent LLM client not initialized at startup:",
        (e as Error).message,
      );
    }
  }
}
