"use client";

import { useState, useCallback, useRef } from "react";
import { Client } from "@langchain/langgraph-sdk";
import type {
  StudentProfile,
  AnalystInsight,
  CritiqueResult,
} from "@/app/types/schema";

// Agent node names matching the backend
export type AgentNodeName =
  | "investigator"
  | "external resources"
  | "profile_generator"
  | "drafting"
  | "analyst"
  | "evaluator"
  | "optimizer";

export interface StreamEvent {
  timestamp: Date;
  node: string;
  data: unknown;
  type: "update" | "tool_call" | "tool_result" | "final";
}

export interface AgentOutputs {
  profile?: StudentProfile;
  currentReport?: string;
  insights?: AnalystInsight;
  critique?: CritiqueResult;
  revisionCount: number;
}

export interface UseLangGraphStreamReturn {
  // State
  isStreaming: boolean;
  activeNode: AgentNodeName | null;
  completedNodes: AgentNodeName[];
  events: StreamEvent[];
  outputs: AgentOutputs;
  error: string | null;

  // Actions
  startStream: (targetKnowledge?: string) => Promise<void>;
  stopStream: () => void;
  reset: () => void;
}

const LANGGRAPH_URL = "http://localhost:2024";
const ASSISTANT_ID = "student_agent";

export function useLangGraphStream(): UseLangGraphStreamReturn {
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeNode, setActiveNode] = useState<AgentNodeName | null>(null);
  const [completedNodes, setCompletedNodes] = useState<AgentNodeName[]>([]);
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [outputs, setOutputs] = useState<AgentOutputs>({ revisionCount: 0 });
  const [error, setError] = useState<string | null>(null);

  const clientRef = useRef(new Client({ apiUrl: LANGGRAPH_URL }));
  const abortControllerRef = useRef<AbortController | null>(null);

  const addEvent = useCallback((event: StreamEvent) => {
    setEvents((prev) => [...prev, event]);
  }, []);

  const markNodeComplete = useCallback((node: AgentNodeName) => {
    setCompletedNodes((prev) => {
      if (!prev.includes(node)) {
        return [...prev, node];
      }
      return prev;
    });
  }, []);

  const updateNodeData = useCallback((nodeName: string, data: unknown) => {
    const node = nodeName as AgentNodeName;
    setActiveNode(node);

    // Add event for logging
    addEvent({
      timestamp: new Date(),
      node: nodeName,
      data: data,
      type: "update",
    });

    // Extract specific outputs based on node
    if (nodeName === "investigator") {
      const investigatorData = data as { messages?: Array<{ tool_calls?: Array<{ name: string }>; content?: string }> };
      if (investigatorData.messages && investigatorData.messages.length > 0) {
        const lastMsg = investigatorData.messages[investigatorData.messages.length - 1];
        if (lastMsg.tool_calls && lastMsg.tool_calls.length > 0) {
          addEvent({
            timestamp: new Date(),
            node: nodeName,
            data: {
              action: "tool_call",
              tools: lastMsg.tool_calls.map((tc) => tc.name),
            },
            type: "tool_call",
          });
        }
      }
    }

    if (nodeName === "external resources") {
      addEvent({
        timestamp: new Date(),
        node: nodeName,
        data: { action: "tool_result", preview: JSON.stringify(data).slice(0, 200) },
        type: "tool_result",
      });
    }

    if (nodeName === "profile_generator") {
      setOutputs((prev) => ({
        ...prev,
        profile: data as StudentProfile,
      }));
      markNodeComplete(node);
    }

    if (nodeName === "drafting") {
      setOutputs((prev) => ({
        ...prev,
        currentReport: data as string,
      }));
      markNodeComplete(node);
    }

    if (nodeName === "analyst") {
      setOutputs((prev) => ({
        ...prev,
        insights: data as AnalystInsight,
      }));
      markNodeComplete(node);
    }

    if (nodeName === "evaluator") {
      setOutputs((prev) => ({
        ...prev,
        critique: data as CritiqueResult,
      }));
      markNodeComplete(node);
    }

    if (nodeName === "optimizer") {
      const optimizerData = data as { report?: string; count?: number };
      setOutputs((prev) => ({
        ...prev,
        currentReport: optimizerData.report || prev.currentReport,
        revisionCount: optimizerData.count || prev.revisionCount + 1,
      }));
      markNodeComplete(node);
    }
  }, [addEvent, markNodeComplete]);

  const startStream = useCallback(
    async (targetKnowledge?: string) => {
      setIsStreaming(true);
      setError(null);
      setEvents([]);
      setCompletedNodes([]);
      setOutputs({ revisionCount: 0 });
      setActiveNode(null);

      abortControllerRef.current = new AbortController();

      try {
        // Create a new thread first
        const thread = await clientRef.current.threads.create();

        addEvent({
          timestamp: new Date(),
          node: "system",
          data: { message: `Thread created: ${thread.thread_id}` },
          type: "update",
        });

        // Create initial input for the graph
        const inputState = {
          messages: [
            {
              role: "user",
              content: targetKnowledge 
                ? `请调查一下这个学生，他好像${targetKnowledge}学得很差。`
                : "请开始对该学生的学习情况进行调查分析。",
            },
          ],
          student_id: "std_001",
          target_knowledge: targetKnowledge || "",
          revision_count: 0,
        };

        // Stream the graph execution
        const stream = clientRef.current.runs.stream(
          thread.thread_id,
          ASSISTANT_ID,
          {
            input: inputState,
            streamMode: "updates",
            config: {
              configurable: {
                model_name: "kimi-k2-turbo-preview",
                temperature: 0.1,
                openai_base_url: "https://api.moonshot.cn/v1",
                api_key: process.env.NEXT_PUBLIC_API_KEY || "",
              },
              recursion_limit: 50,
            },
          }
        );

        for await (const chunk of stream) {
          if (abortControllerRef.current?.signal.aborted) {
            break;
          }

          // Add raw event for terminal display
          addEvent({
            timestamp: new Date(),
            node: "raw",
            data: chunk,
            type: "update",
          });

          // Process updates event
          if (chunk.event === "updates" && chunk.data) {
            const nodeData = chunk.data as Record<string, unknown>;

            // Handle each node's data
            if (nodeData.investigator) {
              updateNodeData("investigator", nodeData.investigator);
            }
            if (nodeData["external resources"]) {
              updateNodeData("external resources", nodeData["external resources"]);
            }
            if (nodeData.profile_generator) {
              const profileData = nodeData.profile_generator as { profile?: StudentProfile };
              if (profileData.profile) {
                updateNodeData("profile_generator", profileData.profile);
              }
            }
            if (nodeData.drafting) {
              const draftingData = nodeData.drafting as { current_report?: string };
              if (draftingData.current_report) {
                updateNodeData("drafting", draftingData.current_report);
              }
            }
            if (nodeData.analyst) {
              const analystData = nodeData.analyst as { insights?: AnalystInsight };
              if (analystData.insights) {
                updateNodeData("analyst", analystData.insights);
              }
            }
            if (nodeData.evaluator) {
              const evaluatorData = nodeData.evaluator as { critique?: CritiqueResult };
              if (evaluatorData.critique) {
                updateNodeData("evaluator", evaluatorData.critique);
              }
            }
            if (nodeData.optimizer) {
              const optimizerData = nodeData.optimizer as { current_report?: string; revision_count?: number };
              updateNodeData("optimizer", {
                report: optimizerData.current_report,
                count: optimizerData.revision_count,
              });
            }
          }
        }

        // Mark final event
        addEvent({
          timestamp: new Date(),
          node: "system",
          data: { message: "Stream completed successfully" },
          type: "final",
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        addEvent({
          timestamp: new Date(),
          node: "system",
          data: { error: errorMessage },
          type: "final",
        });
      } finally {
        setIsStreaming(false);
        setActiveNode(null);
      }
    },
    [addEvent, updateNodeData]
  );

  const stopStream = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
    setActiveNode(null);
  }, []);

  const reset = useCallback(() => {
    stopStream();
    setEvents([]);
    setCompletedNodes([]);
    setOutputs({ revisionCount: 0 });
    setError(null);
  }, [stopStream]);

  return {
    isStreaming,
    activeNode,
    completedNodes,
    events,
    outputs,
    error,
    startStream,
    stopStream,
    reset,
  };
}
