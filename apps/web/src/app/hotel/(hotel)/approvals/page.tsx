"use client";

import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { formatCurrency, formatDate } from "@repo/shared";

export default function ApprovalsPage() {
  const { user } = useAuthStore();
  const hotelId = user?.hotelId;

  type CaseItem = {
    id: string;
    caseRef: string;
    title: string;
    category: string;
    severity: string;
    status: string;
    createdAt: Date;
    guest: { name: string };
    compensation?: { amountCents: number; type: string } | null;
  };

  const { data: casesRaw, isLoading } = trpc.supportCase.list.useQuery(
    { hotelId: hotelId ?? undefined, status: "AWAITING_APPROVAL" },
    { enabled: !!hotelId },
  );
  const cases = casesRaw as { items: CaseItem[]; total: number } | undefined;

  const approveCompensation =
    trpc.supportCase.approveCompensation.useMutation();
  const utils = trpc.useUtils();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>

      {isLoading ? (
        <div className="py-20 text-center text-gray-400">Loading...</div>
      ) : !cases?.items.length ? (
        <div className="py-20 text-center">
          <p className="mb-2 text-2xl">✅</p>
          <p className="text-gray-500">No pending approvals</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cases.items.map((c: any) => (
            <div key={c.id} className="rounded-xl border bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        c.severity === "CRITICAL"
                          ? "bg-red-100 text-red-700"
                          : c.severity === "HIGH"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {c.severity}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {c.caseRef}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{c.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Guest: {c.guest.name} · {formatDate(c.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
