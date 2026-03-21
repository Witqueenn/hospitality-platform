"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";

const CATEGORIES = [
  "ROOM_CLEANLINESS",
  "ROOM_NOT_READY",
  "NOISE_COMPLAINT",
  "WIFI_ISSUE",
  "AC_BROKEN",
  "WRONG_ROOM",
  "BILLING_ISSUE",
  "STAFF_BEHAVIOR",
  "SAFETY_CONCERN",
  "FOOD_QUALITY",
  "EVENT_ISSUE",
  "AMENITY_MISSING",
  "CHECK_IN_DELAY",
  "OTHER",
];

export default function NewSupportCasePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    category: "OTHER" as (typeof CATEGORIES)[number],
    title: "",
    description: "",
    roomNumber: "",
    bookingId: "",
    hotelId: user?.hotelId ?? "",
  });
  const [error, setError] = useState<string | null>(null);

  const createCase = (
    trpc.supportCase.create as unknown as {
      useMutation: (opts: unknown) => {
        mutate: (input: Record<string, unknown>) => void;
        isPending: boolean;
      };
    }
  ).useMutation({
    onSuccess: (data: { id: string }) => router.push(`/support/${data.id}`),
    onError: (e: { message: string }) => setError(e.message),
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Report an Issue</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          createCase.mutate({
            hotelId: form.hotelId,
            bookingId: form.bookingId || undefined,
            category: form.category as
              | "ROOM_CLEANLINESS"
              | "ROOM_NOT_READY"
              | "NOISE_COMPLAINT"
              | "WIFI_ISSUE"
              | "AC_BROKEN"
              | "WRONG_ROOM"
              | "BILLING_ISSUE"
              | "STAFF_BEHAVIOR"
              | "SAFETY_CONCERN"
              | "FOOD_QUALITY"
              | "EVENT_ISSUE"
              | "AMENITY_MISSING"
              | "CHECK_IN_DELAY"
              | "OTHER",
            title: form.title,
            description: form.description,
            roomNumber: form.roomNumber || undefined,
          });
        }}
        className="space-y-4 rounded-xl border bg-white p-6"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Issue Category
          </label>
          <select
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value }))
            }
            className="w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
          >
            {CATEGORIES.map((c: any) => (
              <option key={c} value={c}>
                {c.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Issue Title
          </label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
            className="w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
            placeholder="Brief description of the issue"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            required
            rows={4}
            className="w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
            placeholder="Please provide details about the issue..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Room Number (optional)
            </label>
            <input
              value={form.roomNumber}
              onChange={(e) =>
                setForm((f) => ({ ...f, roomNumber: e.target.value }))
              }
              className="w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
              placeholder="e.g. 412"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Hotel ID
            </label>
            <input
              value={form.hotelId}
              onChange={(e) =>
                setForm((f) => ({ ...f, hotelId: e.target.value }))
              }
              required
              className="w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
              placeholder="Hotel UUID"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={createCase.isPending}
          className="w-full rounded-lg bg-[#e94560] py-3 font-semibold text-white transition-colors hover:bg-[#c73652] disabled:opacity-60"
        >
          {createCase.isPending ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
}
