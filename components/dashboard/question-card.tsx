"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AnalysisItem } from "@/app/types/schema";
import {
  CheckCircle2,
  XCircle,
  BookOpen,
  GraduationCap,
  AlertTriangle,
} from "lucide-react";

interface QuestionCardProps {
  item: AnalysisItem;
  onClick?: () => void;
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

export function QuestionCard({ item, onClick }: QuestionCardProps) {
  const isCorrect = item.Is_Correct === 1;
  const complexity = getComplexityBadge(item.Complexity_Level);

  return (
    <Card
      className={cn(
        "border-border/50 hover:border-primary/50 transition-all cursor-pointer group",
        !isCorrect && "border-l-4 border-l-red-500"
      )}
      onClick={onClick}
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
          className="text-sm text-foreground line-clamp-3 prose prose-sm max-w-none"
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

        {!isCorrect && item.Error_Reason && (
          <div className="flex items-start gap-2 p-2 bg-red-500/5 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <div className="text-xs text-red-600">
              <span className="font-medium">Error: </span>
              {item.Error_Reason}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <GraduationCap className="h-3 w-3" />
            {item.gradeName}
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {item.ID.slice(0, 8)}...
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
