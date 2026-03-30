"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchStreamLink } from "@trpc/client";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error: unknown) => {
              // UNAUTHORIZED veya FORBIDDEN hatalarında retry yapma, logout yap
              const code = (error as { data?: { code?: string } })?.data?.code;
              if (code === "UNAUTHORIZED" || code === "FORBIDDEN") {
                useAuthStore.getState().clearAuth();
                if (typeof window !== "undefined") {
                  window.location.href = "/login";
                }
                return false;
              }
              return failureCount < 1;
            },
            staleTime: 30 * 1000,
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchStreamLink({
          url: "/api/trpc",
          headers() {
            const token = useAuthStore.getState().token;
            return token ? { authorization: `Bearer ${token}` } : {};
          },
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </NextThemesProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
