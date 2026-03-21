"use client";

import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Crown, Sparkles, Star, ArrowLeft } from "lucide-react";
import Link from "next/link";

const TIER_COLORS: Record<string, string> = {
  CORE: "from-gray-400 to-gray-600",
  COMFORT: "from-yellow-400 to-yellow-600",
  SIGNATURE: "from-purple-400 to-purple-600",
  SILVER: "from-gray-400 to-gray-600",
  GOLD: "from-yellow-400 to-yellow-600",
  PLATINUM: "from-blue-400 to-blue-600",
  DIAMOND: "from-purple-400 to-purple-600",
  BLACK: "from-gray-800 to-gray-950",
};

export default function VipBenefitsPage() {
  const { user } = useAuthStore();
  const { data: plans, isLoading } = trpc.vip.listPlans.useQuery(
    { tenantId: user?.tenantId },
    { enabled: !!user?.tenantId },
  );

  const list = (plans as any[]) ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/vip" className="rounded-lg p-1.5 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <Crown className="h-7 w-7 text-[#1a1a2e]" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">VIP Benefits</h1>
          <p className="text-sm text-gray-500">
            Everything included in your membership
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="py-20 text-center">
          <Crown className="mx-auto mb-4 h-12 w-12 text-gray-200" />
          <p className="text-gray-500">No VIP plans available.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {list.map((plan: any) => (
            <div
              key={plan.id}
              className="overflow-hidden rounded-2xl shadow-sm"
            >
              {/* Plan header */}
              <div
                className={`bg-gradient-to-r ${TIER_COLORS[plan.tier] ?? "from-gray-500 to-gray-700"} p-6 text-white`}
              >
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-white/40 text-white/40" />
                  <span className="text-sm font-semibold uppercase tracking-wide text-white/80">
                    {plan.tier}
                  </span>
                </div>
                <h2 className="mt-1 text-xl font-bold">{plan.name}</h2>
                {plan.description && (
                  <p className="mt-1 text-sm text-white/70">
                    {plan.description}
                  </p>
                )}
                <div className="mt-3 flex gap-4">
                  {plan.monthlyPriceCents != null && (
                    <div>
                      <span className="text-2xl font-bold">
                        ${(plan.monthlyPriceCents / 100).toFixed(0)}
                      </span>
                      <span className="text-sm text-white/70"> / month</span>
                    </div>
                  )}
                  {plan.yearlyPriceCents != null && (
                    <div className="opacity-80">
                      <span className="text-lg font-semibold">
                        ${(plan.yearlyPriceCents / 100).toFixed(0)}
                      </span>
                      <span className="text-sm text-white/70"> / year</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Benefits list */}
              {plan.benefits?.length > 0 && (
                <div className="border-x border-b bg-white">
                  <div className="divide-y">
                    {plan.benefits.map((benefit: any) => (
                      <div
                        key={benefit.id}
                        className="flex items-start gap-4 p-4"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50">
                          <Sparkles className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {benefit.name}
                          </p>
                          {benefit.description && (
                            <p className="mt-0.5 text-sm text-gray-500">
                              {benefit.description}
                            </p>
                          )}
                          {benefit.valueText && (
                            <span className="mt-1 inline-block rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
                              {benefit.valueText}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
