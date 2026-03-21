"use client";

import { useState } from "react";
import { Bot, RefreshCw, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const AGENTS = [
  {
    id: "matchmaking",
    name: "Matchmaking Agent",
    description: "Matches guest preferences to room types",
  },
  {
    id: "truth-transparency",
    name: "Truth & Transparency Agent",
    description: "Validates hotel data accuracy and noise ratings",
  },
  {
    id: "booking-integrity",
    name: "Booking Integrity Agent",
    description: "Monitors booking anomalies and fraud signals",
  },
  {
    id: "pre-stay-concierge",
    name: "Pre-Stay Concierge Agent",
    description: "Sends pre-arrival personalisation messages",
  },
  {
    id: "stay-support",
    name: "Stay Support Agent",
    description: "Handles in-stay guest requests in real time",
  },
  {
    id: "recovery-compensation",
    name: "Recovery & Compensation Agent",
    description: "Auto-proposes compensation for service failures",
  },
  {
    id: "event-match",
    name: "Event Match Agent",
    description: "Matches event requests to available venues",
  },
  {
    id: "venue-capacity",
    name: "Venue Capacity Agent",
    description: "Optimises venue layout and capacity allocation",
  },
  {
    id: "beo-run-of-show",
    name: "BEO Run-of-Show Agent",
    description: "Generates Banquet Event Orders and run-of-show docs",
  },
  {
    id: "fb-planning",
    name: "F&B Planning Agent",
    description: "Plans food & beverage requirements for events",
  },
  {
    id: "nightlife-experience",
    name: "Nightlife Experience Agent",
    description: "Curates late-night and entertainment experiences",
  },
  {
    id: "insight-hotel-success",
    name: "Hotel Success Insight Agent",
    description: "Generates revenue and occupancy insights for hotel ops",
  },
];

export default function AgentLogsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-[#1a1a2e]" />
          <h1 className="text-2xl font-bold text-gray-900">AI Agent Status</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRefreshKey((k) => k + 1)}
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
        <Activity className="mb-1 inline h-4 w-4" /> All 12 domain agents are
        managed via the BullMQ queue and run as background workers. Real-time
        log streaming is available via the worker process logs.
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AGENTS.map((agent) => (
          <div key={agent.id} className="rounded-xl border bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">{agent.name}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {agent.description}
                </p>
              </div>
              <span className="ml-2 flex-shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                active
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
              Worker listening · Queue: {agent.id}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-3 font-semibold text-gray-900">Queue Overview</h2>
        <p className="text-sm text-gray-400">
          Connect to BullMQ dashboard (Bull Board) at{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
            /admin/queues
          </code>{" "}
          for detailed job metrics, retry controls, and dead-letter inspection.
        </p>
      </div>
    </div>
  );
}
