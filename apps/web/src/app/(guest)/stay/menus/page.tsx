"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Skeleton } from "@/components/ui/skeleton";
import { UtensilsCrossed, ChevronDown, ChevronUp } from "lucide-react";

const MENU_LABELS: Record<string, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  ALL_DAY: "All Day",
  ROOM_SERVICE: "Room Service",
  POOLSIDE: "Poolside",
  BAR: "Bar",
  BRUNCH: "Brunch",
  TASTING: "Tasting Menu",
  SPECIAL: "Special Menu",
};

export default function StayMenusPage() {
  const params = useSearchParams();
  const stayId = params.get("stayId") ?? "";
  const { isAuthenticated } = useAuthStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: menus, isLoading } = trpc.hotelMenu.forStay.useQuery(
    { stayId },
    { enabled: isAuthenticated() && !!stayId },
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-amber-100 p-2">
          <UtensilsCrossed className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Menus</h1>
          <p className="text-sm text-gray-500">
            Dining options during your stay
          </p>
        </div>
      </div>

      {!menus || menus.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          <UtensilsCrossed className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">No menus available right now.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {menus.map((menu) => {
            const isOpen = expanded === menu.id;
            type MenuContent = {
              sections?: Array<{
                name: string;
                items: Array<{
                  name: string;
                  description?: string;
                  price?: number;
                }>;
              }>;
              note?: string;
            };
            const content = menu.content as MenuContent;

            return (
              <div
                key={menu.id}
                className="rounded-xl border bg-white shadow-sm"
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : menu.id)}
                  className="flex w-full items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                      {MENU_LABELS[menu.menuType] ?? menu.menuType}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {menu.name}
                    </span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </button>

                {isOpen && (
                  <div className="border-t px-4 pb-4">
                    {menu.description && (
                      <p className="mt-3 text-sm text-gray-600">
                        {menu.description}
                      </p>
                    )}

                    {/* Render menu sections */}
                    {content.sections && content.sections.length > 0 && (
                      <div className="mt-4 space-y-4">
                        {content.sections.map((section, si) => (
                          <div key={si}>
                            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">
                              {section.name}
                            </h3>
                            <div className="space-y-2">
                              {section.items?.map((item, ii) => (
                                <div
                                  key={ii}
                                  className="flex justify-between gap-4"
                                >
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {item.name}
                                    </p>
                                    {item.description && (
                                      <p className="text-xs text-gray-500">
                                        {item.description}
                                      </p>
                                    )}
                                  </div>
                                  {item.price !== undefined && (
                                    <p className="flex-shrink-0 text-sm font-semibold text-gray-700">
                                      ${(item.price / 100).toFixed(2)}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Fallback: show raw note */}
                    {content.note && (
                      <p className="mt-3 text-sm text-gray-500">
                        {String(content.note)}
                      </p>
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
