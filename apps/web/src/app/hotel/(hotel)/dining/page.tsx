"use client";

import { UtensilsCrossed } from "lucide-react";

export default function DiningPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <UtensilsCrossed className="mb-4 h-16 w-16 text-gray-200" />
      <h1 className="text-2xl font-bold text-gray-900">Dining & F&B</h1>
      <p className="mt-2 max-w-md text-gray-500">
        Restaurant, bar, and room service management is coming soon. Your F&B
        planning agent is already collecting insights in the background.
      </p>
      <div className="mt-6 rounded-lg border border-dashed bg-gray-50 px-6 py-4 text-sm text-gray-400">
        Feature planned · AI F&B Planning Agent active
      </div>
    </div>
  );
}
