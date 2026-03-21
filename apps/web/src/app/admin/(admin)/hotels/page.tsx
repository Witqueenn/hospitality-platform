"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Hotel, Star, MapPin, CheckCircle, XCircle } from "lucide-react";

export default function AdminHotelsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = trpc.hotel.list.useQuery({
    page,
    pageSize: 20,
  });

  const updateStatus = trpc.hotel.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated!");
      void refetch();
    },
    onError: (e: any) => toast.error(e.message || "An error occurred"),
  });

  const STATUS_STYLE: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    INACTIVE: "bg-gray-100 text-gray-500",
    PENDING: "bg-yellow-100 text-yellow-700",
    SUSPENDED: "bg-red-100 text-red-600",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Hotels</h1>
        {data && (
          <p className="text-sm text-gray-400">{data.total} total hotels</p>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : !data?.items.length ? (
        <div className="py-16 text-center">
          <Hotel className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">No hotels found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <div className="divide-y">
            {data.items.map((hotel: any) => (
              <div
                key={hotel.id}
                className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
              >
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-gray-900">{hotel.name}</p>
                    {hotel.starRating && (
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: hotel.starRating }).map(
                          (_, i) => (
                            <Star
                              key={i}
                              className="h-3 w-3 fill-yellow-400 text-yellow-400"
                            />
                          ),
                        )}
                      </div>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[hotel.status] ?? ""}`}
                    >
                      {hotel.status}
                    </span>
                  </div>
                  {hotel.address && (
                    <p className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin className="h-3 w-3" />
                      {typeof hotel.address === "object" &&
                      hotel.address !== null
                        ? `${(hotel.address as Record<string, string>).city ?? ""}, ${(hotel.address as Record<string, string>).country ?? ""}`.replace(
                            /^, |, $/,
                            "",
                          )
                        : ""}
                    </p>
                  )}
                  <p className="font-mono text-xs text-gray-400">
                    /{hotel.slug}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {hotel.status !== "ACTIVE" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-200 text-xs text-green-700 hover:bg-green-50"
                      onClick={() =>
                        updateStatus.mutate({ id: hotel.id, status: "ACTIVE" })
                      }
                      disabled={updateStatus.isPending}
                    >
                      <CheckCircle className="mr-1 h-3.5 w-3.5" /> Activate
                    </Button>
                  )}
                  {(hotel.status === "ACTIVE" || hotel.status === "DRAFT") && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-xs text-red-600 hover:bg-red-50"
                      onClick={() =>
                        updateStatus.mutate({
                          id: hotel.id,
                          status: "SUSPENDED",
                        })
                      }
                      disabled={updateStatus.isPending}
                    >
                      <XCircle className="mr-1 h-3.5 w-3.5" /> Deactivate
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {data && data.total > 20 && (
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center text-sm text-gray-500">
            Page {page} of {Math.ceil(data.total / 20)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page * 20 >= data.total}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
