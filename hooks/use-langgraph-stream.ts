"use client";

import { useState, useCallback, useRef } from "react";
import { Client } from "@langchain/langgraph-sdk";
import {
  buildCacheKey,
  loadTape,
  saveTape,
  createRecorder,
  replayTape,
} from "@/lib/vcr";
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
  analystReferences?: string[];
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
  startStream: (targetKnowledge?: string, studentName?: string) => Promise<void>;
  stopStream: () => void;
  reset: () => void;
}

const LANGGRAPH_URL = "http://localhost:2024";
const ASSISTANT_ID = "student_agent";

/**
 * VCR replay speed multiplier.
 * 1 = real-time (original timing), 2 = 2× faster, 5 = 5× faster, etc.
 * Set to a higher value to reduce replay delay.
 */
const VCR_REPLAY_SPEED = 2;

export function useLangGraphStream(): UseLangGraphStreamReturn {
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeNode, setActiveNode] = useState<AgentNodeName | null>(null);
  const [completedNodes, setCompletedNodes] = useState<AgentNodeName[]>([]);
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [outputs, setOutputs] = useState<AgentOutputs>({ revisionCount: 0 });
  const [error, setError] = useState<string | null>(null);

  const clientRef = useRef(new Client({ apiUrl: LANGGRAPH_URL }));
  const abortControllerRef = useRef<AbortController | null>(null);
  // Track thread/run IDs so we can explicitly cancel backend runs
  const threadIdRef = useRef<string | null>(null);
  const runIdRef = useRef<string | null>(null);

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
      const analystData = data as { insights?: AnalystInsight; analyst_tool_logs?: any };
      
      if (analystData.analyst_tool_logs) {
        const log = analystData.analyst_tool_logs;
        const isSuccess = log.status === "success";
        const refs: string[] = log.references || [];

        addEvent({
          timestamp: new Date(),
          node: nodeName,
          data: {
            action: isSuccess ? "tool_result" : "tool_error",
            tools: [log.tool],
            detail: isSuccess 
              ? `成功检索知识库: ${log.query}` 
              : `知识库检索超时或失败: ${log.error}`,
            status: log.status,
            references: refs,
          },
          type: "tool_result", 
        });

        if (isSuccess && refs.length > 0) {
          setOutputs((prev) => ({
            ...prev,
            analystReferences: refs,
          }));
        }
      }
      setOutputs((prev) => ({
        ...prev,
        insights: analystData.insights as AnalystInsight,
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

  // ─── Shared chunk processor (used by both live and replay paths) ───
  const processChunk = useCallback(
    (chunk: { event: string; data: unknown }) => {
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
          // Pass the full analyst object so updateNodeData can access both insights and analyst_tool_logs
          updateNodeData("analyst", nodeData.analyst);
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
    },
    [addEvent, updateNodeData]
  );

  const startStream = useCallback(
    async (targetKnowledge?: string, studentName?: string) => {
      setIsStreaming(true);
      setError(null);
      setEvents([]);
      setCompletedNodes([]);
      setOutputs({ revisionCount: 0 });
      setActiveNode(null);

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      // Reset run tracking refs
      threadIdRef.current = null;
      runIdRef.current = null;

      try {
        // ── VCR: try to load a cached tape ──────────────────────────
        // Prefer the caller-supplied studentName over re-reading localStorage,
        // so there is no race with the 500 ms debounce write in UserProfileSidebar.
        const cacheKey = studentName
          ? `${studentName.trim()}::${targetKnowledge?.trim() || "_default_"}`
          : buildCacheKey(targetKnowledge);
        let tape = cacheKey ? await loadTape(cacheKey) : null;

        if (tape) {
          // ── REPLAY PATH: play back recorded events ────────────────
          addEvent({
            timestamp: new Date(),
            node: "system",
            data: { message: `[VCR] Replaying cached session (${tape.length} frames)` },
            type: "update",
          });

          for await (const chunk of replayTape(tape, signal, VCR_REPLAY_SPEED)) {
            if (signal.aborted) break;
            processChunk(chunk);
          }
        } else {
          // ── RECORD PATH: live LangGraph stream + record to tape ───
          const recorder = createRecorder();

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
            student_name: studentName || "Zhang Wei",
            target_knowledge: targetKnowledge || "",
            revision_count: 0,
          };

          // Store thread ID so we can cancel the run later
          threadIdRef.current = thread.thread_id;

          // Stream the graph execution
          const stream = clientRef.current.runs.stream(
            thread.thread_id,
            ASSISTANT_ID,
            {
              input: inputState,
              streamMode: "updates",
              signal,
              // Tell the server to cancel the run when the client disconnects
              onDisconnect: "cancel",
              config: {
                configurable: {
                  model_name: "kimi-k2.6",
                  temperature: 0.6,
                  openai_base_url: "https://api.moonshot.cn/v1",
                  api_key: process.env.NEXT_PUBLIC_API_KEY || "",
                },
                recursion_limit: 50,
              },
              // Capture the run ID so we can explicitly cancel it
              onRunCreated: ({ run_id }) => {
                runIdRef.current = run_id;
                addEvent({
                  timestamp: new Date(),
                  node: "system",
                  data: { message: `Run created: ${run_id}` },
                  type: "update",
                });
              },
            }
          );

          for await (const chunk of stream) {
            if (signal.aborted) break;

            // Record every chunk to the tape
            recorder.record({ event: chunk.event, data: chunk.data });

            // Process through the shared pipeline
            processChunk(chunk);
          }

          // Save the recorded tape (fire-and-forget, non-blocking)
          if (cacheKey && recorder.length > 0 && !signal.aborted) {
            const finalTape = recorder.finalize();
            saveTape(cacheKey, finalTape).then((ok) => {
              if (ok) {
                console.log(`[VCR] Tape saved for key "${cacheKey}" (${finalTape.length} frames)`);
              }
            });
          }
        }

        // Mark final event (only if not aborted by the user)
        if (!signal.aborted) {
          addEvent({
            timestamp: new Date(),
            node: "system",
            data: { message: "Stream completed successfully" },
            type: "final",
          });
        } else {
          addEvent({
            timestamp: new Date(),
            node: "system",
            data: { message: "Stream stopped by user" },
            type: "final",
          });
        }
      } catch (err) {
        // Ignore AbortError — it's expected when the user clicks "stop"
        if (err instanceof DOMException && err.name === "AbortError") {
          addEvent({
            timestamp: new Date(),
            node: "system",
            data: { message: "Stream stopped by user" },
            type: "final",
          });
        } else {
          const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
          setError(errorMessage);
          addEvent({
            timestamp: new Date(),
            node: "system",
            data: { error: errorMessage },
            type: "final",
          });
        }
      } finally {
        setIsStreaming(false);
        setActiveNode(null);
      }
    },
    [addEvent, updateNodeData, processChunk]
  );

  const stopStream = useCallback(() => {
    // 1. Abort the client-side stream reader (breaks the for-await loop)
    abortControllerRef.current?.abort();

    // 2. Explicitly cancel the backend run so the server stops processing
    const threadId = threadIdRef.current;
    const runId = runIdRef.current;
    if (threadId && runId) {
      clientRef.current.runs
        .cancel(threadId, runId, /* wait */ false, /* action */ "interrupt")
        .then(() => {
          console.log(`[LangGraph] Run ${runId} cancelled on server`);
        })
        .catch((err) => {
          // Best-effort: if the run already finished or the server is unreachable, ignore
          console.warn(`[LangGraph] Failed to cancel run ${runId}:`, err);
        });
    }

    // 3. Clear tracking refs
    threadIdRef.current = null;
    runIdRef.current = null;

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
