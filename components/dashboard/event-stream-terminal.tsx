"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { StreamEvent } from "@/hooks/use-langgraph-stream";
import { Terminal, ChevronRight } from "lucide-react";

interface EventStreamTerminalProps {
  events: StreamEvent[];
  className?: string;
}

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getEventColor(type: StreamEvent["type"]): string {
  switch (type) {
    case "tool_call":
      return "text-yellow-400";
    case "tool_result":
      return "text-blue-400";
    case "final":
      return "text-green-400";
    default:
      return "text-gray-300";
  }
}

function getNodeColor(node: string): string {
  const colors: Record<string, string> = {
    investigator: "text-purple-400",
    "external resources": "text-cyan-400",
    profile_generator: "text-pink-400",
    drafting: "text-orange-400",
    analyst: "text-emerald-400",
    evaluator: "text-red-400",
    optimizer: "text-indigo-400",
    system: "text-gray-500",
    raw: "text-gray-400",
  };
  return colors[node] || "text-gray-400";
}

function formatEventData(data: unknown): string {
  if (typeof data === "string") return data;
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}

export function EventStreamTerminal({
  events,
  className,
}: EventStreamTerminalProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new events arrive
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div
      className={cn(
        "flex flex-col bg-gray-950 rounded-lg border border-gray-800 overflow-hidden",
        className
      )}
    >
      {/* Terminal Header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border-b border-gray-800 shrink-0">
        <Terminal className="h-4 w-4 text-green-400" />
        <span className="text-sm font-mono text-gray-300">
          Agent Event Stream
        </span>
        <div className="ml-auto flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <div className="h-3 w-3 rounded-full bg-green-500" />
        </div>
      </div>

      {/* Terminal Content - Scrollable */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4"
        style={{ minHeight: 0 }}
      >
        <div className="font-mono text-xs space-y-3">
          {events.length === 0 ? (
            <div className="text-gray-500 flex items-center gap-2">
              <span className="animate-pulse">▋</span>
              <span>Waiting for agent stream...</span>
            </div>
          ) : (
            events.map((event, index) => (
              <div key={index} className="group">
                <div className="flex items-start gap-2 flex-wrap">
                  <span className="text-gray-600 shrink-0">
                    [{formatTimestamp(event.timestamp)}]
                  </span>
                  <ChevronRight
                    className={cn("h-3 w-3 mt-0.5 shrink-0", getNodeColor(event.node))}
                  />
                  <span className={cn("font-semibold shrink-0", getNodeColor(event.node))}>
                    {event.node}
                  </span>
                  <span className={cn("shrink-0", getEventColor(event.type))}>
                    [{event.type}]
                  </span>
                </div>
                <pre className="mt-1 ml-4 text-gray-400 whitespace-pre-wrap break-words bg-gray-900/50 rounded p-2 overflow-x-auto text-[10px] leading-relaxed max-h-32 overflow-y-auto">
                  {formatEventData(event.data)}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
