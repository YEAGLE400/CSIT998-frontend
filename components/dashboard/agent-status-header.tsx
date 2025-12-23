"use client";

import { cn } from "@/lib/utils";
import type { AgentNodeName } from "@/hooks/use-langgraph-stream";
import {
  Search,
  Database,
  User,
  FileText,
  Lightbulb,
  CheckCircle,
  Wrench,
} from "lucide-react";

interface AgentStatusHeaderProps {
  activeNode: AgentNodeName | null;
  completedNodes: AgentNodeName[];
  isStreaming: boolean;
}

interface AgentNodeConfig {
  id: AgentNodeName;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const AGENT_NODES: AgentNodeConfig[] = [
  {
    id: "investigator",
    label: "Investigator",
    icon: Search,
    description: "Analyzing student data",
  },
  {
    id: "external resources",
    label: "Tools",
    icon: Database,
    description: "Fetching external data",
  },
  {
    id: "profile_generator",
    label: "Profiler",
    icon: User,
    description: "Building student profile",
  },
  {
    id: "drafting",
    label: "Drafter",
    icon: FileText,
    description: "Writing initial report",
  },
  {
    id: "analyst",
    label: "Analyst",
    icon: Lightbulb,
    description: "Generating insights",
  },
  {
    id: "evaluator",
    label: "Evaluator",
    icon: CheckCircle,
    description: "Reviewing quality",
  },
  {
    id: "optimizer",
    label: "Optimizer",
    icon: Wrench,
    description: "Refining report",
  },
];

export function AgentStatusHeader({
  activeNode,
  completedNodes,
  isStreaming,
}: AgentStatusHeaderProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {AGENT_NODES.map((node) => {
        const Icon = node.icon;
        const isActive = activeNode === node.id;
        const isCompleted = completedNodes.includes(node.id);

        return (
          <div
            key={node.id}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-300 min-w-[80px]",
              isActive && "bg-primary/20 ring-2 ring-primary/50",
              isCompleted && !isActive && "bg-green-500/10",
              !isActive && !isCompleted && "bg-muted/30 opacity-50"
            )}
          >
            <div
              className={cn(
                "relative h-10 w-10 rounded-full flex items-center justify-center transition-all",
                isActive && "bg-primary text-primary-foreground animate-pulse",
                isCompleted && !isActive && "bg-green-500 text-white",
                !isActive && !isCompleted && "bg-muted text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {isActive && isStreaming && (
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-yellow-400 animate-ping" />
              )}
              {isCompleted && !isActive && (
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-400" />
              )}
            </div>
            <span
              className={cn(
                "text-xs font-medium text-center",
                isActive && "text-primary",
                isCompleted && !isActive && "text-green-600",
                !isActive && !isCompleted && "text-muted-foreground"
              )}
            >
              {node.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
