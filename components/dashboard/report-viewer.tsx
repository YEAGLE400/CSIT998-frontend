"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AnalystInsight, CritiqueResult } from "@/app/types/schema";
import { FileText, AlertTriangle, CheckCircle, Star, RefreshCw } from "lucide-react";

interface ReportViewerProps {
  report?: string;
  insights?: AnalystInsight;
  critique?: CritiqueResult;
  revisionCount: number;
  isLoading?: boolean;
}

export function ReportViewer({
  report,
  insights,
  critique,
  revisionCount,
  isLoading,
}: ReportViewerProps) {
  if (isLoading) {
    return (
      <Card className="border-border/50 h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Learning Report</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 h-full flex flex-col">
      <CardHeader className="pb-2 shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Learning Report</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {revisionCount > 0 && (
              <Badge variant="outline" className="text-xs">
                <RefreshCw className="h-3 w-3 mr-1" />
                Rev {revisionCount}
              </Badge>
            )}
            {critique && (
              <Badge
                variant={critique.pass_review ? "default" : "secondary"}
                className={critique.pass_review ? "bg-green-500" : ""}
              >
                <Star className="h-3 w-3 mr-1" />
                Score: {critique.score}/10
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden flex flex-col gap-4 min-h-0">
        {/* Insights Section */}
        {insights && (
          <div className="shrink-0 space-y-2 p-3 bg-amber-500/5 rounded-lg border border-amber-500/20 overflow-hidden">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Thinking Traps Identified
            </div>
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
              {insights.thinking_traps.map((trap, idx) => (
                <Badge key={idx} variant="outline" className="text-xs bg-amber-500/10 text-amber-700 break-all whitespace-normal h-auto py-1 text-left max-w-full">
                  <span >{trap}</span>
                </Badge>
              ))}
            </div>
            {insights.pitfall_guide && (
              <p className="text-xs text-muted-foreground mt-2 break-words">
                {insights.pitfall_guide}
              </p>
            )}
          </div>
        )}
        {critique && !critique.pass_review && (
          <div className="shrink-0 p-3 bg-blue-500/5 rounded-lg border border-blue-500/20 overflow-hidden">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-600 mb-1">
              <CheckCircle className="h-4 w-4 shrink-0" />
              Evaluator Feedback
            </div>
            <p className="text-xs text-muted-foreground break-words">{critique.feedback}</p>
          </div>
        )}
        <ScrollArea className="flex-1 min-h-0">
          {report ? (
            <div className="prose prose-sm max-w-none dark:prose-invert 
              prose-headings:text-foreground prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2
              prose-p:text-muted-foreground prose-p:my-2 prose-p:break-words
              prose-strong:text-foreground 
              prose-li:text-muted-foreground prose-li:my-0.5
              prose-ul:my-2 prose-ol:my-2
              prose-table:text-xs prose-table:w-full
              prose-th:bg-muted/50 prose-th:p-2 prose-th:text-left prose-th:font-medium prose-th:border prose-th:border-border
              prose-td:p-2 prose-td:border prose-td:border-border prose-td:break-words
              prose-tr:border-b prose-tr:border-border
              prose-code:text-xs prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-muted prose-pre:p-3 prose-pre:rounded-lg prose-pre:overflow-x-auto
              pr-4"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{report}</ReactMarkdown>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Report will be generated after analysis
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
