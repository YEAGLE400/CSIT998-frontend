"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { StudentProfile } from "@/app/types/schema";
import { User, Target, Brain, Lightbulb, FileText } from "lucide-react";

interface StudentProfileCardProps {
  profile?: StudentProfile;
  isLoading?: boolean;
}

export function StudentProfileCard({ profile, isLoading }: StudentProfileCardProps) {
  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Student Profile</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Student Profile</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center text-muted-foreground">
            Profile will appear after analysis
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Student Profile</CardTitle>
          </div>
          {profile.identified_knowledge_point && (
            <Badge variant="default" className="bg-primary/90 text-xs">
              <Target className="h-3 w-3 mr-1 shrink-0" />
              <span>{profile.identified_knowledge_point}</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Brain className="h-4 w-4 text-purple-500 shrink-0" />
                Summary
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pl-6 break-words">
                {profile.summary}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Lightbulb className="h-4 w-4 text-yellow-500 shrink-0" />
                Root Cause Analysis
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pl-6 break-words">
                {profile.root_cause}
              </p>
            </div>

            {profile.evidence && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                  Key Evidence
                </div>
                <div className="pl-6 space-y-2">
                  {profile.evidence.stat_highlights && (
                    <div className="p-2 bg-blue-500/5 rounded-lg overflow-hidden">
                      <p className="text-xs text-blue-600 font-medium mb-1">Statistics</p>
                      <p className="text-xs text-muted-foreground break-words whitespace-pre-wrap">
                        {profile.evidence.stat_highlights}
                      </p>
                    </div>
                  )}
                  {profile.evidence.student_trait && (
                    <div className="p-2 bg-purple-500/5 rounded-lg overflow-hidden">
                      <p className="text-xs text-purple-600 font-medium mb-1">Student Traits</p>
                      <p className="text-xs text-muted-foreground break-words">
                        {profile.evidence.student_trait}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
