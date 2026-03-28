"use client";

export const dynamic = "force-dynamic";

import { useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Wifi, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function StayWifiPage() {
  const params = useSearchParams();
  const stayId = params.get("stayId") ?? "";
  const { isAuthenticated } = useAuthStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: networks, isLoading } = trpc.hotelWifi.forGuest.useQuery(
    { stayId },
    { enabled: isAuthenticated() && !!stayId },
  );

  const copy = (text: string, id: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-blue-100 p-2">
          <Wifi className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Wi-Fi Access</h1>
          <p className="text-sm text-gray-500">Connect to the hotel network</p>
        </div>
      </div>

      {!networks || networks.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          <Wifi className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">
            Wi-Fi information is not available yet.
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Please contact the front desk.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {networks.map((net) => (
            <div
              key={net.id}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              {net.zone && (
                <span className="mb-2 inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                  {net.zone}
                </span>
              )}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Network Name (SSID)</p>
                    <p className="mt-0.5 font-mono text-base font-semibold text-gray-900">
                      {net.networkName}
                    </p>
                  </div>
                  <button
                    onClick={() => copy(net.networkName, `ssid-${net.id}`)}
                    className="rounded-lg border p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                  >
                    {copiedId === `ssid-${net.id}` ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between border-t pt-3">
                  <div>
                    <p className="text-xs text-gray-500">Password</p>
                    <p className="mt-0.5 font-mono text-base font-semibold text-gray-900">
                      {net.password}
                    </p>
                  </div>
                  <button
                    onClick={() => copy(net.password, `pw-${net.id}`)}
                    className="rounded-lg border p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                  >
                    {copiedId === `pw-${net.id}` ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {net.description && (
                <p className="mt-3 text-xs text-gray-400">{net.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
        <p className="font-medium">Having trouble connecting?</p>
        <p className="mt-1 text-blue-600">
          Contact the front desk or tap <strong>Request Support</strong> from
          your stay dashboard.
        </p>
      </div>
    </div>
  );
}
