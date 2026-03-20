import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@repo/api";
import { headers } from "next/headers";

export const trpcServer = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${process.env["NEXTAUTH_URL"] ?? "http://localhost:3000"}/api/trpc`,
      async headers() {
        const h = await headers();
        return { cookie: h.get("cookie") ?? "" };
      },
    }),
  ],
});
