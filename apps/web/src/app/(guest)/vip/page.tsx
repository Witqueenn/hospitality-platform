"use client";

import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Crown, Check, Zap, Star } from "lucide-react";

const TIER_COLORS: Record<string, string> = {
  CORE: "from-slate-400 to-slate-600",
  COMFORT: "from-blue-500 to-blue-700",
  SIGNATURE: "from-amber-400 to-amber-600",
};

const TIER_ICONS: Record<string, React.ReactNode> = {
  CORE: <Star className="h-6 w-6" />,
  COMFORT: <Zap className="h-6 w-6" />,
  SIGNATURE: <Crown className="h-6 w-6" />,
};

export default function VipPage() {
  const { data: plansRaw, isLoading: plansLoading } =
    trpc.vip.listPlans.useQuery({});
  const plans = plansRaw as any[] | undefined;
  const { data: membership, isLoading: membershipLoading } =
    trpc.vip.myMembership.useQuery();

  const enrollMutation = (trpc.vip.enrollMembership as any).useMutation({
    onSuccess: () =>
      toast.success("Welcome to VIP! Your membership is now active."),
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const handleEnroll = (planId: string) => {
    enrollMutation.mutate({
      vipPlanId: planId,
      startsAt: new Date().toISOString(),
      source: "web",
    });
  };

  if (plansLoading || membershipLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Current membership banner */}
      {membership && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <Crown className="h-8 w-8" />
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-white/80">
                Your Membership
              </p>
              <h2 className="text-2xl font-bold">
                {(membership.vipPlan as any)?.name}
              </h2>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Badge className="bg-white/20 text-white hover:bg-white/20">
              {membership.status}
            </Badge>
            <span className="text-sm text-white/70">
              Active since {new Date(membership.startsAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <Crown className="h-12 w-12 text-amber-500" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">VIP Membership</h1>
        <p className="mx-auto mt-2 max-w-xl text-gray-500">
          Unlock exclusive benefits, priority access, and curated experiences
          across our entire network
        </p>
      </div>

      {/* Plans */}
      {!plans || plans.length === 0 ? (
        <p className="text-center text-gray-400">
          No membership plans available yet.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const tier = plan.tier as string;
            const benefits = (plan.benefits ?? []) as {
              id: string;
              name: string;
              description: string | null;
            }[];
            const isCurrentPlan = (membership?.vipPlan as any)?.id === plan.id;

            return (
              <div
                key={plan.id}
                className={`overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition hover:shadow-lg ${
                  isCurrentPlan ? "border-amber-400" : "border-gray-100"
                }`}
              >
                {/* Tier header */}
                <div
                  className={`bg-gradient-to-br ${TIER_COLORS[tier] ?? "from-gray-400 to-gray-600"} p-6 text-white`}
                >
                  <div className="flex items-center justify-between">
                    {TIER_ICONS[tier] ?? <Star className="h-6 w-6" />}
                    {isCurrentPlan && (
                      <Badge className="bg-white/20 text-white">Current</Badge>
                    )}
                  </div>
                  <h3 className="mt-3 text-xl font-bold">{plan.name}</h3>
                  {plan.monthlyPriceCents ? (
                    <p className="mt-1 text-2xl font-bold">
                      ${(plan.monthlyPriceCents / 100).toFixed(0)}
                      <span className="text-sm font-normal text-white/70">
                        {" "}
                        / month
                      </span>
                    </p>
                  ) : (
                    <p className="mt-1 text-lg font-semibold text-white/70">
                      Contact us
                    </p>
                  )}
                </div>

                <div className="space-y-4 p-6">
                  {plan.description && (
                    <p className="text-sm text-gray-500">{plan.description}</p>
                  )}

                  {benefits.length > 0 && (
                    <ul className="space-y-2">
                      {benefits.map((b) => (
                        <li
                          key={b.id}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          <span>{b.name}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? "outline" : "default"}
                    style={!isCurrentPlan ? { backgroundColor: "#1a1a2e" } : {}}
                    disabled={isCurrentPlan || enrollMutation.isPending}
                    onClick={() => !isCurrentPlan && handleEnroll(plan.id)}
                  >
                    {isCurrentPlan ? "Current Plan" : "Get Started"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
