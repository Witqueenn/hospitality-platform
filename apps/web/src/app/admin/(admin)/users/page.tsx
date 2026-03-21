"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Users, UserPlus, Building2 } from "lucide-react";

const STAFF_ROLES = [
  "HOTEL_ADMIN",
  "HOTEL_MANAGER",
  "FRONT_DESK",
  "RESERVATIONS_MANAGER",
  "EVENTS_MANAGER",
  "BANQUET_MANAGER",
  "FB_MANAGER",
  "GUEST_RELATIONS",
  "OPERATIONS_MANAGER",
  "FINANCE_APPROVER",
];

const ROLE_STYLE: Record<string, string> = {
  HOTEL_ADMIN: "bg-purple-100 text-purple-700",
  HOTEL_MANAGER: "bg-blue-100 text-blue-700",
  FRONT_DESK: "bg-cyan-100 text-cyan-700",
  RESERVATIONS_MANAGER: "bg-teal-100 text-teal-700",
  EVENTS_MANAGER: "bg-orange-100 text-orange-700",
  BANQUET_MANAGER: "bg-amber-100 text-amber-700",
  FB_MANAGER: "bg-lime-100 text-lime-700",
  GUEST_RELATIONS: "bg-green-100 text-green-700",
  OPERATIONS_MANAGER: "bg-indigo-100 text-indigo-700",
  FINANCE_APPROVER: "bg-rose-100 text-rose-700",
};

export default function AdminUsersPage() {
  const [selectedHotelId, setSelectedHotelId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", role: "FRONT_DESK" });

  const { data: hotelsData, isLoading: loadingHotels } =
    trpc.hotel.list.useQuery({ page: 1, pageSize: 100 });

  const {
    data: staff,
    isLoading: loadingStaff,
    refetch,
  } = trpc.auth.listStaff.useQuery(
    { hotelId: selectedHotelId },
    { enabled: !!selectedHotelId },
  );

  const inviteMutation = trpc.auth.inviteStaff.useMutation({
    onSuccess: () => {
      toast.success("Staff member invited!");
      setOpen(false);
      setForm({ email: "", name: "", role: "FRONT_DESK" });
      void refetch();
    },
    onError: (e: any) => toast.error(e.message || "An error occurred"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Users & Staff</h1>
        {selectedHotelId && (
          <Button
            onClick={() => setOpen(true)}
            className="bg-[#1a1a2e] hover:bg-[#16213e]"
          >
            <UserPlus className="mr-2 h-4 w-4" /> Invite Staff
          </Button>
        )}
      </div>

      {/* Hotel picker */}
      <div className="rounded-xl border bg-white p-4">
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
          <Building2 className="h-4 w-4" /> Select Hotel
        </label>
        {loadingHotels ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <select
            value={selectedHotelId}
            onChange={(e) => setSelectedHotelId(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">— Choose a hotel —</option>
            {hotelsData?.items.map((h: any) => (
              <option key={h.id} value={h.id}>
                {h.name} (
                {typeof h.address === "object" && h.address !== null
                  ? ((h.address as Record<string, string>).city ?? "")
                  : ""}
                )
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Staff list */}
      {!selectedHotelId ? (
        <div className="py-12 text-center">
          <Users className="mx-auto mb-4 h-12 w-12 text-gray-200" />
          <p className="text-gray-400">Select a hotel to view its staff.</p>
        </div>
      ) : loadingStaff ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : !staff?.length ? (
        <div className="py-12 text-center">
          <Users className="mx-auto mb-4 h-12 w-12 text-gray-200" />
          <p className="text-gray-400">No staff assigned to this hotel.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <div className="divide-y">
            {staff.map((s: any) => (
              <div
                key={s.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <div>
                  <p className="font-medium text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${ROLE_STYLE[s.role] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {s.role.replace(/_/g, " ")}
                  </span>
                  <span
                    className={`text-xs ${s.isActive ? "text-green-600" : "text-gray-400"}`}
                  >
                    {s.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Staff Member</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              inviteMutation.mutate({
                hotelId: selectedHotelId,
                email: form.email,
                name: form.name,
                role: form.role as
                  | "HOTEL_ADMIN"
                  | "HOTEL_MANAGER"
                  | "FRONT_DESK"
                  | "RESERVATIONS_MANAGER"
                  | "EVENTS_MANAGER"
                  | "BANQUET_MANAGER"
                  | "FB_MANAGER"
                  | "GUEST_RELATIONS"
                  | "OPERATIONS_MANAGER"
                  | "FINANCE_APPROVER",
              });
            }}
          >
            <div>
              <label className="mb-1 block text-sm font-medium">Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email *</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Role *</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                {STAFF_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#1a1a2e]"
                disabled={inviteMutation.isPending}
              >
                Invite
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
