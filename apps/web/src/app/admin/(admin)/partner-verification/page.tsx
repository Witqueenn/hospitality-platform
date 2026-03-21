"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Handshake,
  CheckCircle,
  XCircle,
  Building2,
  ChevronDown,
  ChevronUp,
  Mail,
  Globe,
} from "lucide-react";

const PARTNER_TYPE_LABELS: Record<string, string> = {
  HOTEL: "Hotel",
  MOBILITY: "Mobility",
  EXPERIENCE: "Experience",
  AMENITY: "Amenity",
  TRUSTED_STAY_HOST: "Trusted Stay Host",
  OTHER: "Other",
};

export default function PartnerVerificationPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: partners, isLoading, refetch } = trpc.partner.list.useQuery();

  const updateMutation = (trpc.partner.update as any).useMutation({
    onSuccess: (_: unknown, vars: any) => {
      toast.success(`Partner ${vars.isActive ? "activated" : "deactivated"}.`);
      void refetch();
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const list = (partners as any[]) ?? [];
  const pending = list.filter((p: any) => !p.isActive);
  const active = list.filter((p: any) => p.isActive);

  const PartnerCard = ({
    partner: p,
    showActions,
  }: {
    partner: any;
    showActions?: boolean;
  }) => {
    const isExpanded = expandedId === p.id;
    const contactInfo = (p.contactInfo as any) ?? {};

    return (
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1a1a2e]/10">
            <Building2 className="h-6 w-6 text-[#1a1a2e]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-gray-900">{p.name}</p>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                {PARTNER_TYPE_LABELS[p.partnerType] ?? p.partnerType}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  p.isActive
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {p.isActive ? "Active" : "Pending"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-400">
              {p.slug} · Joined {new Date(p.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {showActions && (
              <>
                {!p.isActive ? (
                  <Button
                    size="sm"
                    className="bg-emerald-600 text-xs hover:bg-emerald-700"
                    onClick={() =>
                      updateMutation.mutate({ id: p.id, isActive: true })
                    }
                    disabled={updateMutation.isPending}
                  >
                    <CheckCircle className="mr-1 h-3.5 w-3.5" /> Approve
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-200 text-xs text-red-600 hover:bg-red-50"
                    onClick={() =>
                      updateMutation.mutate({ id: p.id, isActive: false })
                    }
                    disabled={updateMutation.isPending}
                  >
                    <XCircle className="mr-1 h-3.5 w-3.5" /> Suspend
                  </Button>
                )}
              </>
            )}
            <button
              onClick={() => setExpandedId(isExpanded ? null : p.id)}
              className="rounded p-1 text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-3 border-t bg-gray-50 px-4 py-4">
            {/* Commission rules */}
            {p.commissionRules?.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-gray-400">
                  Commission Rules
                </p>
                <div className="space-y-1">
                  {p.commissionRules.map((r: any) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-600">
                        {r.productType ?? "All"}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {r.commissionPercent}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {contactInfo.email && (
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-center gap-1 hover:text-[#1a1a2e]"
                >
                  <Mail className="h-4 w-4" /> {contactInfo.email}
                </a>
              )}
              {contactInfo.website && (
                <a
                  href={contactInfo.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-[#1a1a2e]"
                >
                  <Globe className="h-4 w-4" /> Website
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Handshake className="h-7 w-7 text-[#1a1a2e]" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Partner Verification
          </h1>
          <p className="text-sm text-gray-500">
            Approve and manage platform partners
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{pending.length}</p>
          <p className="text-xs text-gray-500">Pending Approval</p>
        </div>
        <div className="rounded-xl border bg-white p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{active.length}</p>
          <p className="text-xs text-gray-500">Active Partners</p>
        </div>
        <div className="rounded-xl border bg-white p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{list.length}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
      </div>

      {/* Pending section */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-yellow-600">
            Pending Approval ({pending.length})
          </h2>
          {pending.map((p: any) => (
            <PartnerCard key={p.id} partner={p} showActions />
          ))}
        </div>
      )}

      {/* Active section */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
          Active Partners ({active.length})
        </h2>
        {active.length === 0 ? (
          <div className="py-10 text-center">
            <CheckCircle className="mx-auto mb-4 h-10 w-10 text-emerald-200" />
            <p className="text-sm text-gray-500">No active partners yet.</p>
          </div>
        ) : (
          active.map((p: any) => (
            <PartnerCard key={p.id} partner={p} showActions />
          ))
        )}
      </div>
    </div>
  );
}
