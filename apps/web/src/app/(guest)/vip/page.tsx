"use client";

import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Crown, Check, Zap, Star } from "lucide-react";

const TIER_HEADER_STYLES: Record<string, React.CSSProperties> = {
  CORE: {
    background:
      "linear-gradient(135deg, rgba(100,116,139,0.85), rgba(71,85,105,0.85))",
    color: "white",
  },
  COMFORT: {
    background:
      "linear-gradient(135deg, rgba(59,130,246,0.85), rgba(99,102,241,0.85))",
    color: "white",
  },
  SIGNATURE: {
    background:
      "linear-gradient(135deg, rgba(245,158,11,0.90), rgba(217,119,6,0.90))",
    color: "white",
  },
};

const TIER_BORDER_STYLES: Record<string, React.CSSProperties> = {
  CORE: {},
  COMFORT: {},
  SIGNATURE: {
    border: "2px solid #f59e0b",
    boxShadow:
      "0 0 0 1px rgba(245,158,11,0.2), 0 8px 32px rgba(245,158,11,0.12)",
  },
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
      toast.success("VIP'e hoş geldiniz! Üyeliğiniz aktif edildi."),
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
      <div
        className="min-h-screen px-6 py-16"
        style={{ backgroundColor: "rgb(var(--nv-bg))" }}
      >
        <div className="mx-auto max-w-5xl space-y-6">
          <div
            className="h-32 animate-pulse rounded-2xl"
            style={{ backgroundColor: "rgb(var(--nv-surface))" }}
          />
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-2xl"
                style={{ backgroundColor: "rgb(var(--nv-surface))" }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "rgb(var(--nv-bg))" }}
    >
      {/* Current membership banner */}
      {membership && (
        <div
          style={{
            background:
              "linear-gradient(to right, rgba(245,158,11,0.90), rgba(217,119,6,0.90))",
          }}
          className="px-6 py-4"
        >
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-white" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
                  Üyeliğiniz
                </p>
                <p className="font-bold text-white">
                  {(membership.vipPlan as any)?.name}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-white/20 px-3 py-0.5 text-sm font-semibold text-white">
                Aktif
              </span>
              <span className="text-sm text-white/70">
                Başlangıç:{" "}
                {new Date(membership.startsAt).toLocaleDateString("tr")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Hero — centered crown */}
      <div className="nv-hero dot-grid relative overflow-hidden px-6 py-20">
        <div
          className="pointer-events-none absolute left-1/4 top-0 h-[300px] w-[300px] rounded-full blur-[100px]"
          style={{ backgroundColor: "rgb(124 58 237 / 0.08)" }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full blur-[100px]"
          style={{ backgroundColor: "rgb(245 158 11 / 0.10)" }}
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 flex justify-center">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(245,158,11,0.20), rgba(217,119,6,0.10))",
                  border: "1px solid rgb(245 158 11 / 0.25)",
                }}
              >
                <Crown className="h-10 w-10" style={{ color: "#f59e0b" }} />
              </div>
            </div>
            <h1
              className="mb-4 text-4xl font-bold md:text-6xl"
              style={{ color: "rgb(var(--nv-text))" }}
            >
              VIP <span className="text-gradient">Üyelik</span>
            </h1>
            <p
              className="mx-auto max-w-xl text-lg"
              style={{ color: "rgb(var(--nv-muted))" }}
            >
              Tüm ağımızda özel avantajlar, öncelikli erişim ve özel deneyimler
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-12">
        {!plans || plans.length === 0 ? (
          <div className="py-20 text-center">
            <p style={{ color: "rgb(var(--nv-muted))" }}>
              Üyelik planı bulunamadı
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan, i) => {
              const tier = plan.tier as string;
              const benefits = (plan.benefits ?? []) as {
                id: string;
                name: string;
                description: string | null;
              }[];
              const isCurrentPlan =
                (membership?.vipPlan as any)?.id === plan.id;
              const isSignature = tier === "SIGNATURE";

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="nv-card overflow-hidden"
                  style={
                    isSignature
                      ? TIER_BORDER_STYLES.SIGNATURE
                      : isCurrentPlan
                        ? { border: "2px solid #f59e0b" }
                        : {}
                  }
                >
                  {/* Tier header */}
                  <div
                    className="p-6"
                    style={TIER_HEADER_STYLES[tier] ?? TIER_HEADER_STYLES.CORE}
                  >
                    <div className="flex items-center justify-between">
                      {TIER_ICONS[tier] ?? <Star className="h-6 w-6" />}
                      {isCurrentPlan && (
                        <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold text-white">
                          Mevcut Plan
                        </span>
                      )}
                      {isSignature && !isCurrentPlan && (
                        <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold text-white">
                          En Popüler
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 text-xl font-bold">{plan.name}</h3>
                    {plan.monthlyPriceCents ? (
                      <p className="mt-1 text-2xl font-bold">
                        ${(plan.monthlyPriceCents / 100).toFixed(0)}
                        <span className="text-sm font-normal opacity-70">
                          {" "}
                          / ay
                        </span>
                      </p>
                    ) : (
                      <p className="mt-1 text-lg font-semibold opacity-70">
                        Bizimle iletişime geçin
                      </p>
                    )}
                  </div>

                  <div className="space-y-4 p-6">
                    {plan.description && (
                      <p
                        className="text-sm"
                        style={{ color: "rgb(var(--nv-muted))" }}
                      >
                        {plan.description}
                      </p>
                    )}

                    {benefits.length > 0 && (
                      <div>
                        <p
                          className="mb-2 text-xs font-semibold uppercase tracking-widest"
                          style={{ color: "rgb(var(--nv-dim))" }}
                        >
                          Avantajlar
                        </p>
                        <ul className="space-y-2">
                          {benefits.map((b) => (
                            <li
                              key={b.id}
                              className="flex items-start gap-2 text-sm"
                              style={{ color: "rgb(var(--nv-muted))" }}
                            >
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#22c55e]" />
                              <span>{b.name}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <button
                      className="w-full rounded-xl py-2.5 text-sm font-semibold transition active:scale-95"
                      style={
                        isCurrentPlan
                          ? {
                              border: "1px solid rgb(var(--nv-border) / 0.12)",
                              color: "rgb(var(--nv-muted))",
                              cursor: "default",
                            }
                          : {
                              backgroundColor: isSignature
                                ? "#f59e0b"
                                : "#f97316",
                              color: "white",
                            }
                      }
                      disabled={isCurrentPlan || enrollMutation.isPending}
                      onClick={() => !isCurrentPlan && handleEnroll(plan.id)}
                    >
                      {isCurrentPlan ? "Mevcut Plan" : "Başla"}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
