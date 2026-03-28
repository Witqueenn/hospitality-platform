"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  MessageSquare,
  Send,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  WELCOME: "Welcome",
  WIFI_DELIVERY: "Wi-Fi",
  SERVICE_UPDATE: "Service Update",
  PROMOTION: "Promotion",
  CHECKOUT_REMINDER: "Checkout",
  GENERAL: "General",
};

const CATEGORY_BADGE: Record<string, string> = {
  WELCOME: "bg-green-100 text-green-700",
  WIFI_DELIVERY: "bg-blue-100 text-blue-700",
  SERVICE_UPDATE: "bg-indigo-100 text-indigo-700",
  PROMOTION: "bg-amber-100 text-amber-700",
  CHECKOUT_REMINDER: "bg-orange-100 text-orange-700",
  GENERAL: "bg-gray-100 text-gray-600",
};

const CATEGORIES = [
  "SERVICE_UPDATE",
  "ALERT",
  "UPSELL",
  "CHECKOUT_REMINDER",
  "WELCOME",
  "EVENT",
  "DINING",
  "WIFI",
] as const;

export default function HotelStayMessagingPage() {
  const { user } = useAuthStore();
  const hotelId = user?.hotelId ?? "";
  const [expandedStayId, setExpandedStayId] = useState<string | null>(null);
  const [replyForm, setReplyForm] = useState<{
    stayId: string;
    guestId: string;
    body: string;
    category: string;
  } | null>(null);

  const { data, isLoading, refetch } = trpc.inStayMessage.listByHotel.useQuery(
    { hotelId, pageSize: 50 },
    { enabled: !!hotelId },
  );

  const sendMutation = trpc.inStayMessage.send.useMutation({
    onSuccess: () => {
      toast.success("Message sent.");
      void refetch();
      setReplyForm(null);
    },
    onError: (err) => toast.error(err.message),
  });

  function handleSend() {
    if (!replyForm?.body.trim()) {
      toast.error("Message body is required.");
      return;
    }
    sendMutation.mutate({
      hotelId,
      guestId: replyForm.guestId,
      stayId: replyForm.stayId,
      body: replyForm.body,
      category: replyForm.category as
        | "EVENT"
        | "DINING"
        | "WELCOME"
        | "WIFI"
        | "UPSELL"
        | "ALERT"
        | "SERVICE_UPDATE"
        | "CHECKOUT_REMINDER",
    });
  }

  // Group messages by stayId
  const grouped = data?.items.reduce<Record<string, typeof data.items>>(
    (acc, msg) => {
      const key = msg.stayId;
      if (!acc[key]) acc[key] = [];
      acc[key].push(msg);
      return acc;
    },
    {},
  );

  const stayIds = Object.keys(grouped ?? {});

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-6 w-6 text-[#1a1a2e]" />
        <h1 className="text-2xl font-bold text-gray-900">In-Stay Messaging</h1>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : stayIds.length === 0 ? (
        <div className="rounded-xl border bg-white py-12 text-center">
          <MessageSquare className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">No messages yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {stayIds.map((stayId) => {
            const messages = grouped![stayId]!;
            const latest = messages[0]!;
            const isExpanded = expandedStayId === stayId;
            const unreadCount = messages.filter((m) => !m.readAt).length;

            return (
              <div
                key={stayId}
                className="overflow-hidden rounded-xl border bg-white shadow-sm"
              >
                <div
                  className="flex cursor-pointer items-start justify-between gap-3 p-4"
                  onClick={() => setExpandedStayId(isExpanded ? null : stayId)}
                >
                  <div className="flex flex-1 items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#1a1a2e]/10">
                      <User className="h-4 w-4 text-[#1a1a2e]" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-gray-900">
                          {`Stay ${stayId.slice(-6).toUpperCase()}`}
                        </p>
                        {unreadCount > 0 && (
                          <span className="flex-shrink-0 rounded-full bg-[#1a1a2e] px-1.5 py-0.5 text-xs font-bold text-white">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-sm text-gray-500">
                        {latest.body}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(latest.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  )}
                </div>

                {isExpanded && (
                  <div className="border-t bg-gray-50">
                    {/* Message thread */}
                    <div className="max-h-72 space-y-3 overflow-y-auto p-4">
                      {[...messages].reverse().map((msg) => {
                        const isHotel = !msg.guestId;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isHotel ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-xs rounded-2xl px-3.5 py-2 text-sm ${
                                isHotel
                                  ? "rounded-br-sm bg-[#1a1a2e] text-white"
                                  : "rounded-bl-sm border bg-white text-gray-800 shadow-sm"
                              }`}
                            >
                              <div className="mb-0.5 flex items-center gap-1.5">
                                <span
                                  className={`text-xs font-medium ${isHotel ? "text-white/70" : "text-gray-400"}`}
                                >
                                  {CATEGORY_LABELS[msg.category] ??
                                    msg.category}
                                </span>
                                {!isHotel && !msg.readAt && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                )}
                              </div>
                              <p>{msg.body}</p>
                              <p
                                className={`mt-1 text-xs ${isHotel ? "text-white/50" : "text-gray-400"}`}
                              >
                                {new Date(msg.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Reply form */}
                    {replyForm?.stayId === stayId ? (
                      <div className="space-y-3 border-t p-4">
                        <div className="flex gap-2">
                          <select
                            value={replyForm.category}
                            onChange={(e) =>
                              setReplyForm({
                                ...replyForm,
                                category: e.target.value,
                              })
                            }
                            className="rounded-lg border px-2 py-1.5 text-xs"
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c}>
                                {CATEGORY_LABELS[c]}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <textarea
                            value={replyForm.body}
                            onChange={(e) =>
                              setReplyForm({
                                ...replyForm,
                                body: e.target.value,
                              })
                            }
                            placeholder="Type your message..."
                            rows={2}
                            className="flex-1 resize-none rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
                          />
                          <div className="flex flex-col gap-1.5">
                            <Button
                              size="sm"
                              className="h-full bg-[#1a1a2e] px-3 hover:bg-[#16213e]"
                              onClick={handleSend}
                              disabled={sendMutation.isPending}
                            >
                              <Send className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-auto px-3 py-1 text-xs"
                              onClick={() => setReplyForm(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border-t p-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() =>
                            setReplyForm({
                              stayId,
                              guestId: latest.guestId,
                              body: "",
                              category: "SERVICE_UPDATE",
                            })
                          }
                        >
                          <Send className="mr-1.5 h-3.5 w-3.5" />
                          Reply
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
