"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShieldAlert, Plus, X, Lock } from "lucide-react";

const NOTE_TYPE_LABELS: Record<string, string> = {
  RESPECTFUL: "Respectful",
  HELPFUL: "Helpful",
  COMPLAINT: "Complaint",
  DAMAGE_RISK: "Damage Risk",
  ABUSE: "Abuse",
  SAFETY_ISSUE: "Safety Issue",
  VIP: "VIP Note",
};

const SEVERITY_BADGE: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

const NOTE_TYPES = Object.keys(
  NOTE_TYPE_LABELS,
) as (keyof typeof NOTE_TYPE_LABELS)[];
const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

interface NoteForm {
  staffProfileId: string;
  guestId: string;
  noteType: string;
  severity: string;
  content: string;
}

const EMPTY_FORM: NoteForm = {
  staffProfileId: "",
  guestId: "",
  noteType: "COMPLAINT",
  severity: "LOW",
  content: "",
};

export default function HotelConductNotesPage() {
  const { user } = useAuthStore();
  const hotelId = user?.hotelId ?? "";
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NoteForm>(EMPTY_FORM);
  const [staffFilter, setStaffFilter] = useState<string | undefined>();

  const { data: staffData } = trpc.staffProfile.listByHotel.useQuery(
    { hotelId },
    { enabled: !!hotelId },
  );

  const { data, isLoading, refetch } = trpc.guestConduct.listForStaff.useQuery(
    { staffProfileId: staffFilter ?? "" },
    { enabled: !!hotelId && !!staffFilter },
  );

  const createMutation = trpc.guestConduct.create.useMutation({
    onSuccess: () => {
      toast.success("Note added.");
      void refetch();
      setForm(EMPTY_FORM);
      setShowForm(false);
    },
    onError: (err) => toast.error(err.message),
  });

  function handleSubmit() {
    if (!form.staffProfileId || !form.content.trim()) {
      toast.error("Staff member and note body are required.");
      return;
    }
    createMutation.mutate({
      staffProfileId: form.staffProfileId,
      noteType: form.noteType as Parameters<
        typeof createMutation.mutate
      >[0]["noteType"],
      severity: form.severity as Parameters<
        typeof createMutation.mutate
      >[0]["severity"],
      guestId: form.guestId,
      content: form.content,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-6 w-6 text-[#1a1a2e]" />
          <h1 className="text-2xl font-bold text-gray-900">Conduct Notes</h1>
          <span className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
            <Lock className="h-3 w-3" />
            Internal Only
          </span>
        </div>
        {!showForm && (
          <Button
            className="bg-[#1a1a2e] hover:bg-[#16213e]"
            onClick={() => setShowForm(true)}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Note
          </Button>
        )}
      </div>

      {/* Add Note Form */}
      {showForm && (
        <div className="space-y-4 rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Add Conduct Note</h2>
            <button
              onClick={() => {
                setShowForm(false);
                setForm(EMPTY_FORM);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
            This note is strictly internal and will never be shown to guests or
            the staff member.
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Staff Member *
              </label>
              <select
                value={form.staffProfileId}
                onChange={(e) =>
                  setForm({ ...form, staffProfileId: e.target.value })
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="">Select staff member...</option>
                {staffData?.items.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.role ?? s.department}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Guest ID (UUID) *
              </label>
              <input
                type="text"
                value={form.guestId}
                onChange={(e) => setForm({ ...form, guestId: e.target.value })}
                placeholder="Paste guest user ID..."
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Note Type
              </label>
              <select
                value={form.noteType}
                onChange={(e) => setForm({ ...form, noteType: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                {NOTE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {NOTE_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Severity
              </label>
              <select
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Note *
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={3}
                placeholder="Describe the observation, incident, or commendation..."
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              className="bg-[#1a1a2e] hover:bg-[#16213e]"
              onClick={handleSubmit}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Saving..." : "Add Note"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setForm(EMPTY_FORM);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Staff selector */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          View notes for staff member:
        </label>
        <select
          value={staffFilter ?? ""}
          onChange={(e) => setStaffFilter(e.target.value || undefined)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">Select staff member...</option>
          {staffData?.items.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Notes list */}
      {!staffFilter ? (
        <div className="rounded-xl border bg-white py-12 text-center">
          <ShieldAlert className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">
            Select a staff member to view their conduct notes.
          </p>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="rounded-xl border bg-white py-12 text-center">
          <ShieldAlert className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">
            No conduct notes for this staff member.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((note) => (
            <div
              key={note.id}
              className="rounded-xl border bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${SEVERITY_BADGE[note.severity]}`}
                    >
                      {note.severity}
                    </span>
                    <span className="text-xs text-gray-500">
                      {NOTE_TYPE_LABELS[note.noteType] ?? note.noteType}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-700">
                    {note.content}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(note.createdAt).toLocaleString()}
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
