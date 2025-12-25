"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Upload,
  Search,
  Play,
  RotateCcw,
  StopCircle,
  ChevronLeft,
  ChevronRight,
  Database,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AgentStatusHeader,
  EventStreamTerminal,
  CapabilityRadarChart,
  QuestionCard,
  StudentProfileCard,
  ReportViewer,
  UserProfileSidebar,
} from "@/components/dashboard";
import { useLangGraphStream } from "@/hooks/use-langgraph-stream";
import { fetchAnalysis, fetchKnowledgeStats } from "@/lib/api";
import type { AnalysisItem, AnalysisResponse, KnowledgeStats } from "@/app/types/schema";

type DashboardStage = "empty" | "data" | "agent";

const PAGE_SIZE = 12;

export default function DashboardPage() {
  const [stage, setStage] = useState<DashboardStage>("empty");
  const [questions, setQuestions] = useState<AnalysisItem[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [searchKnowledge, setSearchKnowledge] = useState("");
  const [activeKnowledge, setActiveKnowledge] = useState(""); // 当前激活的知识点搜索
  const [knowledgeStats, setKnowledgeStats] = useState<{
    accuracy?: number;
    correct_count?: number;
    wrong_count?: number;
  } | null>(null);
  const [hasCompletedAnalysis, setHasCompletedAnalysis] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const totalPages = Math.ceil(totalQuestions / PAGE_SIZE);

  const {
    isStreaming,
    activeNode,
    completedNodes,
    events,
    outputs,
    error,
    startStream,
    stopStream,
    reset: resetStream,
  } = useLangGraphStream();

  // 加载分析数据
  const loadAnalysisData = useCallback(async (page: number) => {
    setIsLoadingData(true);
    try {
      const response: AnalysisResponse = await fetchAnalysis(page, PAGE_SIZE);
      setQuestions(response.items);
      setTotalQuestions(response.total);
      setCurrentPage(response.page);
    } catch (err) {
      console.error("Failed to fetch analysis data:", err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // 加载知识点统计数据
  const loadKnowledgeData = useCallback(async (knowledge: string, page: number) => {
    setIsLoadingData(true);
    try {
      const response: KnowledgeStats = await fetchKnowledgeStats(knowledge, page, PAGE_SIZE);
      setQuestions(response.items);
      setTotalQuestions(response.total);
      setCurrentPage(response.page);
      setKnowledgeStats({
        accuracy: response.accuracy,
        correct_count: response.correct_count,
        wrong_count: response.wrong_count,
      });
    } catch (err) {
      console.error("Failed to fetch knowledge stats:", err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  const handleFileUpload = useCallback(async () => {
    setIsLoadingData(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setActiveKnowledge("");
    setKnowledgeStats(null);
    setSearchKnowledge("");
    setStage("data");
    await loadAnalysisData(1);
  }, [loadAnalysisData]);

  const handleKnowledgeSearch = useCallback(async () => {
    if (!searchKnowledge.trim()) return;
    setActiveKnowledge(searchKnowledge);
    setCurrentPage(1);
    await loadKnowledgeData(searchKnowledge, 1);
  }, [searchKnowledge, loadKnowledgeData]);

  // 分页切换
  const handlePageChange = useCallback(async (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    
    if (activeKnowledge) {
      await loadKnowledgeData(activeKnowledge, newPage);
    } else {
      await loadAnalysisData(newPage);
    }
  }, [activeKnowledge, totalPages, currentPage, loadKnowledgeData, loadAnalysisData]);

  // 清除知识点搜索，返回全部数据
  const handleClearKnowledgeSearch = useCallback(async () => {
    setActiveKnowledge("");
    setSearchKnowledge("");
    setKnowledgeStats(null);
    await loadAnalysisData(1);
  }, [loadAnalysisData]);


  const handleStartAnalysis = useCallback(async () => {
    setStage("agent");
    await startStream(searchKnowledge || undefined);
  }, [startStream, searchKnowledge]);

  const handleBackToData = useCallback(() => {
    resetStream();
    setHasCompletedAnalysis(true);
    setStage("data");
  }, [resetStream]);

  const handleRegenerate = useCallback(async () => {
    resetStream();
    await startStream(searchKnowledge || undefined);
  }, [resetStream, startStream, searchKnowledge]);

  return (
    <div className="min-h-screen bg-background">
      <UserProfileSidebar />
      <aside className="fixed left-0 top-0 h-full w-16 border-r border-border/40 bg-card flex flex-col items-center py-4 gap-6 z-20">
        <Link href="/" className="flex items-center justify-center">
          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
        </Link>

        <div className="flex-1 flex flex-col gap-2">
          <Button
            variant={stage === "empty" ? "default" : "ghost"}
            size="icon"
            className="h-10 w-10"
            onClick={() => setStage("empty")}
          >
            <Upload className="h-5 w-5" />
          </Button>
          <Button
            variant={stage === "data" ? "default" : "ghost"}
            size="icon"
            className="h-10 w-10"
            disabled={questions.length === 0}
            onClick={() => {
              // 如果从 agent 阶段切换到 data 阶段，标记分析已完成
              if (stage === "agent") {
                setHasCompletedAnalysis(true);
              }
              setStage("data");
            }}
          >
            <Database className="h-5 w-5" />
          </Button>
          <Button
            variant={stage === "agent" ? "default" : "ghost"}
            size="icon"
            className="h-10 w-10"
            disabled={questions.length === 0}
            onClick={() => setStage("agent")}
          >
            <Zap className="h-5 w-5" />
          </Button>
        </div>
      </aside>

      <main className="ml-16">
        <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-xl font-bold text-foreground">
                  Learning Analytics and Feedback Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  {stage === "empty" && "Upload data to begin analysis"}
                  {stage === "data" && `${totalQuestions} questions loaded`}
                  {stage === "agent" && "Multi-Agent Analysis in Progress"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {stage === "data" && (
                  <>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Search knowledge point..."
                        value={searchKnowledge}
                        onChange={(e) => setSearchKnowledge(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleKnowledgeSearch()}
                        className="w-64"
                      />
                      <Button variant="outline" size="icon" onClick={handleKnowledgeSearch}>
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button onClick={handleStartAnalysis} className="gap-2">
                      <Play className="h-4 w-4" />
                      Start AI Analysis
                    </Button>
                  </>
                )}

                {stage === "agent" && (
                  <>
                    <Button variant="outline" onClick={handleBackToData} className="gap-2">
                      <ChevronLeft className="h-4 w-4" />
                      Back to Data
                    </Button>
                    {isStreaming ? (
                      <Button variant="destructive" onClick={stopStream} className="gap-2">
                        <StopCircle className="h-4 w-4" />
                        Stop
                      </Button>
                    ) : (
                      <Button onClick={handleRegenerate} className="gap-2">
                        <RotateCcw className="h-4 w-4" />
                        Regenerate
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
            {stage === "agent" && (
              <div className="mt-4">
                <AgentStatusHeader
                  activeNode={activeNode}
                  completedNodes={completedNodes}
                  isStreaming={isStreaming}
                />
              </div>
            )}
          </div>
        </header>
        <div className="p-6">
          {stage === "empty" && (
            <div className="space-y-6">
              <Card className="border-dashed border-2 border-border/50 bg-muted/20">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Upload Student Data
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                    Upload an Excel file containing student answer records or just load from your history to begin the analysis.
                    The system will process and display the data.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <div className="flex items-center gap-4">
                    <Button
                      size="lg"
                      onClick={() => {
                        fileInputRef.current?.click();
                        // handleFileUpload();
                      }}
                      disabled={isLoadingData}
                      className="gap-2"
                    >
                      {isLoadingData ? (
                        <>Loading...</>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Select File
                        </>
                      )}
                    </Button>
                    <Button
                    size="lg"
                    variant="outline"
                    onClick={handleFileUpload}
                    disabled={isLoadingData}
                    className="gap-2"
                  >
                    <Database className="h-4 w-4" />
                    Load from user history
                  </Button>
                  </div>
                </CardContent>
              </Card>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="border-border/30">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-16 w-full" />
                      <div className="flex gap-1">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {stage === "data" && (
            <div className="space-y-6">
              {knowledgeStats && (
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-sm py-1 px-3">
                      Knowledge: {activeKnowledge}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-sm py-1 px-3 ${
                        knowledgeStats.accuracy && knowledgeStats.accuracy >= 0.6
                          ? "bg-green-500/10 text-green-600"
                          : "bg-red-500/10 text-red-600"
                      }`}
                    >
                      Accuracy: {((knowledgeStats.accuracy || 0) * 100).toFixed(1)}%
                    </Badge>
                    <Badge variant="outline" className="text-sm py-1 px-3 bg-green-500/10 text-green-600">
                      Correct: {knowledgeStats.correct_count}
                    </Badge>
                    <Badge variant="outline" className="text-sm py-1 px-3 bg-red-500/10 text-red-600">
                      Wrong: {knowledgeStats.wrong_count}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleClearKnowledgeSearch}>
                    Clear Filter
                  </Button>
                </div>
              )}

              {/* Question Grid */}
              {isLoadingData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="border-border/30">
                      <CardContent className="p-4 space-y-3">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {questions.map((item) => (
                    <QuestionCard 
                      key={item.ID} 
                      item={item} 
                      showJudgeExplanation={hasCompletedAnalysis}
                    />
                  ))}
                </div>
              )}
              {/* Pagination */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, totalQuestions)} of {totalQuestions} questions
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || isLoadingData}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {/* 显示页码按钮 */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={isLoadingData}
                          className="w-9"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || isLoadingData}
                    className="gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
            </div>
          )}
          {stage === "agent" && (
            <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-220px)]">
              <div className="flex-1 space-y-4 overflow-auto order-2 lg:order-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StudentProfileCard
                    profile={outputs.profile}
                    isLoading={isStreaming && !outputs.profile}
                  />
                  <CapabilityRadarChart
                    data={outputs.profile?.radar_data}
                    isLoading={isStreaming && !outputs.profile}
                  />
                </div>
                <div className="min-h-[400px]">
                  <ReportViewer
                    report={outputs.currentReport}
                    insights={outputs.insights}
                    critique={outputs.critique}
                    revisionCount={outputs.revisionCount}
                    isLoading={isStreaming && !outputs.currentReport}
                  />
                </div>
              </div>
              <div className="w-full lg:w-[500px] xl:w-[600px] shrink-0 order-1 lg:order-2">
                <EventStreamTerminal events={events} className="h-[400px] lg:h-[calc(100vh-220px)]" />
              </div>
            </div>
          )}
          {error && (
            <div className="fixed bottom-4 right-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg max-w-md">
              <p className="text-sm text-red-600 font-medium">Error</p>
              <p className="text-xs text-red-500">{error}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
