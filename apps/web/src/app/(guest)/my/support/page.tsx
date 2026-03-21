"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { formatDate } from "@repo/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Plus, ChevronRight } from "lucide-react";

interface SupportCaseItem {
  id: string;
  severity: string;
  status: string;
  category: string;
  title: string;
  createdAt: string;
  caseRef?: string;
  hotel?: { name: string };
}

const SEVERITY_STYLE: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700",
  HIGH: "bg-orange-100 text-orange-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-gray-100 text-gray-500",
};

const STATUS_STYLE: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-purple-100 text-purple-700",
  AWAITING_HOTEL: "bg-yellow-100 text-yellow-700",
  AWAITING_GUEST: "bg-orange-100 text-orange-700",
  AWAITING_APPROVAL: "bg-pink-100 text-pink-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-500",
  ESCALATED: "bg-red-200 text-red-800",
};

export default function MySupportPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) router.push("/login");
  }, [isAuthenticated, router]);

  const { data, isLoading } = trpc.supportCase.list.useQuery(
    { page: 1, pageSize: 50 },
    { enabled: isAuthenticated() },
  );

  if (!isAuthenticated()) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Support Cases</h1>
        <Button
          onClick={() => router.push("/support/new")}
          className="bg-[#1a1a2e] hover:bg-[#16213e]"
        >
          <Plus className="mr-2 h-4 w-4" /> New Case
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : !data?.items.length ? (
        <div className="py-16 text-center">
          <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">No support cases yet.</p>
          <Button
            className="mt-4 bg-[#1a1a2e]"
            onClick={() => router.push("/support/new")}
          >
            Open a case
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {(data.items as SupportCaseItem[]).map((c: any) => (
            <button
              key={c.id}
              onClick={() => router.push(`/support/${c.id}`)}
              className="w-full rounded-xl border bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${SEVERITY_STYLE[c.severity] ?? ""}`}
                    >
                      {c.severity}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[c.status] ?? ""}`}
                    >
                      {c.status.replace(/_/g, " ")}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {c.category.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="font-medium text-gray-900">{c.title}</p>
                  <p className="text-xs text-gray-400">
                    {c.hotel?.name ?? ""} · Opened {formatDate(c.createdAt)}
                    {c.caseRef && ` · ${c.caseRef}`}
                  </p>
                </div>
                <ChevronRight className="mt-1 h-5 w-5 flex-shrink-0 text-gray-300" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
