"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertTriangle, Plus, CheckCircle2, Clock } from "lucide-react";

const CATEGORIES = [
  { value: "ROOM_ISSUE", label: "Room Issue" },
  { value: "SERVICE_FAILURE", label: "Service Failure" },
  { value: "STAFF_COMPLAINT", label: "Staff Complaint" },
  { value: "FACILITY_ISSUE", label: "Facility Issue" },
  { value: "BILLING_DISPUTE", label: "Billing Dispute" },
  { value: "NOISE_COMPLAINT", label: "Noise Complaint" },
  { value: "SAFETY_CONCERN", label: "Safety Concern" },
  { value: "FOOD_QUALITY", label: "Food Quality" },
  { value: "OTHER", label: "Other" },
] as const;

const SEVERITIES = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
] as const;

const STATUS_BADGE: Record<string, string> = {
  OPEN: "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  AWAITING_RESPONSE: "bg-yellow-100 text-yellow-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-600",
};

export default function StayIssuesPage() {
  const params = useSearchParams();
  const stayId = params.get("stayId") ?? "";
  const { isAuthenticated } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    category: "ROOM_ISSUE" as (typeof CATEGORIES)[number]["value"],
    severity: "MEDIUM" as (typeof SEVERITIES)[number]["value"],
    title: "",
    description: "",
  });

  // We'll use a search on incidents for this guest
  const createMutation = trpc.incident.create.useMutation({
    onSuccess: () => {
      toast.success("Issue reported. Our team will follow up shortly.");
      setShowForm(false);
      setForm({
        category: "ROOM_ISSUE",
        severity: "MEDIUM",
        title: "",
        description: "",
      });
    },
    onError: (err) => toast.error(err.message),
  });

  // Get the stayId -> hotelId lookup
  const { data: staySession } = trpc.guestStay.getById.useQuery(
    { id: stayId },
    { enabled: !!stayId && isAuthenticated() },
  );

  const handleSubmit = () => {
    if (!form.title || !form.description || !staySession) {
      toast.error("Please fill in all fields.");
      return;
    }
    createMutation.mutate({
      hotelId: staySession.hotelId,
      stayId,
      category: form.category,
      severity: form.severity,
      title: form.title,
      description: form.description,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-red-100 p-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Report an Issue</h1>
            <p className="text-sm text-gray-500">
              We want to make things right
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="bg-[#1a1a2e] hover:bg-[#16213e]"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Report
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">
            Tell us what happened
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    category: e.target.value as typeof form.category,
                  }))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Severity
              </label>
              <div className="flex gap-2">
                {SEVERITIES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() =>
                      setForm((f) => ({ ...f, severity: s.value }))
                    }
                    className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition-colors ${
                      form.severity === s.value
                        ? "border-[#1a1a2e] bg-[#1a1a2e]/5 text-[#1a1a2e]"
                        : "border-gray-200 text-gray-600"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Brief summary of the issue"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="What happened? Please be specific."
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-[#1a1a2e] hover:bg-[#16213e]"
                onClick={handleSubmit}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Submitting..." : "Submit Report"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success state / empty */}
      {!showForm && (
        <div className="rounded-xl border bg-white p-8 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-gray-600">Having a problem during your stay?</p>
          <p className="mt-1 text-sm text-gray-400">
            Tap &quot;Report&quot; above. We&apos;ll respond quickly.
          </p>
          <div className="mt-4 rounded-lg bg-gray-50 p-3 text-left text-xs text-gray-500">
            <p className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Our team aims to respond within 30 minutes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
