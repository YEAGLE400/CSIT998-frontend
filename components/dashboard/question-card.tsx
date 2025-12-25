"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { AnalysisItem } from "@/app/types/schema";
import {
  CheckCircle2,
  XCircle,
  BookOpen,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  FileText,
  PenLine,
  AlertCircle,
} from "lucide-react";

interface QuestionCardProps {
  item: AnalysisItem;
  onClick?: () => void;
  showJudgeExplanation?: boolean;
}

function getDifficultyColor(diff: string): string {
  if (diff.toLowerCase().includes("easy")) return "bg-green-500/10 text-green-600";
  if (diff.toLowerCase().includes("medium")) return "bg-yellow-500/10 text-yellow-600";
  if (diff.toLowerCase().includes("hard")) return "bg-red-500/10 text-red-600";
  return "bg-gray-500/10 text-gray-600";
}

function getComplexityBadge(level: string): { label: string; color: string } {
  if (level.includes("Simple")) return { label: "Simple", color: "bg-blue-500/10 text-blue-600" };
  if (level.includes("Medium")) return { label: "Medium", color: "bg-purple-500/10 text-purple-600" };
  if (level.includes("Complex")) return { label: "Complex", color: "bg-orange-500/10 text-orange-600" };
  return { label: level, color: "bg-gray-500/10 text-gray-600" };
}

export function QuestionCard({ item, onClick, showJudgeExplanation = false }: QuestionCardProps) {
  const isCorrect = item.Is_Correct === 1;
  const complexity = getComplexityBadge(item.Complexity_Level);
  
  const [isAnaLatexOpen, setIsAnaLatexOpen] = useState(false);
  const [isStudentAnswerOpen, setIsStudentAnswerOpen] = useState(false);
  const [isJudgeExplanationOpen, setIsJudgeExplanationOpen] = useState(false);

  return (
    <Card
      className={cn(
        "border-border/50 hover:border-primary/50 transition-all group",
        !isCorrect && "border-l-4 border-l-red-500"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500 shrink-0" />
            )}
            <Badge variant="outline" className={getDifficultyColor(item.Objective_Diff)}>
              {item.Objective_Diff}
            </Badge>
            <Badge variant="outline" className={complexity.color}>
              {complexity.label}
            </Badge>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {item.Type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          className="text-sm text-foreground line-clamp-3 prose prose-sm max-w-none cursor-pointer"
          onClick={onClick}
          dangerouslySetInnerHTML={{
            __html: item.QueHTML.slice(0, 200) + (item.QueHTML.length > 200 ? "..." : ""),
          }}
        />
        {item.images && item.images.length > 0 && (
          <div className="flex gap-2 overflow-x-auto py-1">
            {item.images.slice(0, 2).map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Question image ${idx + 1}`}
                className="h-16 w-auto rounded border border-border object-contain"
              />
            ))}
            {item.images.length > 2 && (
              <div className="h-16 w-16 rounded border border-border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                +{item.images.length - 2}
              </div>
            )}
          </div>
        )}
        <div className="flex flex-wrap gap-1">
          {item.knowName.slice(0, 3).map((tag, idx) => (
            <Badge key={idx} variant="outline" className="text-xs bg-primary/5">
              <BookOpen className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
          {item.knowName.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{item.knowName.length - 3}
            </Badge>
          )}
        </div>

        {/* 可展开的标准解析 AnaLatex */}
        {item.AnaLatex && (
          <Collapsible open={isAnaLatexOpen} onOpenChange={setIsAnaLatexOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between p-2 h-auto bg-blue-500/5 hover:bg-blue-500/10"
              >
                <div className="flex items-center gap-2 text-blue-600">
                  <FileText className="h-4 w-4" />
                  <span className="text-xs font-medium">Standard Solution</span>
                </div>
                {isAnaLatexOpen ? (
                  <ChevronUp className="h-4 w-4 text-blue-600" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-blue-600" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
                <div
                  className="text-xs text-foreground prose prose-sm max-w-none overflow-auto max-h-48"
                  dangerouslySetInnerHTML={{ __html: item.AnaLatex }}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* 可展开的学生原始回答 Student_Answer_Raw */}
        {item.Student_Answer_Raw && (
          <Collapsible open={isStudentAnswerOpen} onOpenChange={setIsStudentAnswerOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between p-2 h-auto bg-purple-500/5 hover:bg-purple-500/10"
              >
                <div className="flex items-center gap-2 text-purple-600">
                  <PenLine className="h-4 w-4" />
                  <span className="text-xs font-medium">Student Answer</span>
                </div>
                {isStudentAnswerOpen ? (
                  <ChevronUp className="h-4 w-4 text-purple-600" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-purple-600" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="p-3 bg-purple-500/5 rounded-lg border border-purple-500/20">
                <div className="text-xs text-foreground whitespace-pre-wrap overflow-auto max-h-48">
                  {item.Student_Answer_Raw}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* AI 分析后显示的 Judge_Explanation */}
        {showJudgeExplanation && !isCorrect && item.Judge_Explanation && (
          <Collapsible open={isJudgeExplanationOpen} onOpenChange={setIsJudgeExplanationOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between p-2 h-auto bg-red-500/5 hover:bg-red-500/10"
              >
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-xs font-medium">AI Error Analysis</span>
                </div>
                {isJudgeExplanationOpen ? (
                  <ChevronUp className="h-4 w-4 text-red-600" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-red-600" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="p-3 bg-red-500/5 rounded-lg border border-red-500/20">
                <div className="text-xs text-foreground whitespace-pre-wrap overflow-auto max-h-48">
                  {item.Judge_Explanation}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <GraduationCap className="h-3 w-3" />
            {item.gradeName}
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {item.ID}...
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
