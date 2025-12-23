"use client";

import { useState, useEffect, useCallback } from "react";
import {
  User,
  ChevronRight,
  ChevronLeft,
  Save,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface UserProfile {
  name: string;
  grade: string;
  currentScore: string;
  learningAttitude: string;
  cognitiveTraits: string;
  historicalBackground: string;
  goal: string;
  teacherComment: string;
}

const defaultProfile: UserProfile = {
  name: "李明",
  grade: "高二（理科班）",
  currentScore: "数学 95/150，处于班级中下游",
  learningAttitude: "非常端正，作业从不拖欠，笔记记得很满。",
  cognitiveTraits: "形象思维尚可。抽象逻辑和代数运算较差，有一定畏难情绪",
  historicalBackground: "高一上学期因病休学两个月，导致函数部分基础薄弱",
  goal: "希望能考上一本",
  teacherComment: "缺乏数感。",
};

const STORAGE_KEY = "aura-learning-user-profile";

export function UserProfileSidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfile(parsed);
      } catch (e) {
        console.error("Failed to parse saved profile:", e);
      }
    }
  }, []);
  const saveProfile = useCallback((newProfile: UserProfile) => {
    setIsSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
      setLastSaved(new Date());
    } catch (e) {
      console.error("Failed to save profile:", e);
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  }, []);

  const handleFieldChange = useCallback(
    (field: keyof UserProfile, value: string) => {
      const newProfile = { ...profile, [field]: value };
      setProfile(newProfile);
      const timeoutId = setTimeout(() => {
        saveProfile(newProfile);
      }, 500);
      return () => clearTimeout(timeoutId);
    },
    [profile, saveProfile]
  );

  const handleReset = useCallback(() => {
    setProfile(defaultProfile);
    saveProfile(defaultProfile);
  }, [saveProfile]);

  return (
    <>
      {/* 展开/收起按钮 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "fixed top-1/2 -translate-y-1/2 z-30 h-24 w-6 bg-primary/90 hover:bg-primary text-primary-foreground rounded-l-lg flex items-center justify-center transition-all duration-300 shadow-lg",
          isExpanded ? "right-[400px]" : "right-0"
        )}
        title={isExpanded ? "Collapse" : "Expand"}
      >
        {isExpanded ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* 侧边栏面板 */}
      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-[400px] bg-card border-l border-border/40 shadow-xl z-20 transition-transform duration-300 overflow-hidden",
          isExpanded ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          {/* 头部 */}
          <div className="p-4 border-b border-border/40 bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Student Basic Information</h2>
                  <p className="text-xs text-muted-foreground">
                    {isSaving ? (
                      <span className="text-primary">saving...</span>
                    ) : lastSaved ? (
                      `last saved: ${lastSaved.toLocaleTimeString()}`
                    ) : (
                      "Write down some basic information, and let AI give you feedback!"
                    )}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="gap-1 text-xs"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* 基本信息 */}
            <Card className="border-border/50">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-medium">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs text-muted-foreground">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="grade" className="text-xs text-muted-foreground">
                    Age
                  </Label>
                  <Input
                    id="grade"
                    value={profile.grade}
                    onChange={(e) => handleFieldChange("grade", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="currentScore" className="text-xs text-muted-foreground">
                    Current academic performance
                  </Label>
                  <Input
                    id="currentScore"
                    value={profile.currentScore}
                    onChange={(e) => handleFieldChange("currentScore", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 学习画像 */}
            <Card className="border-border/50">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-medium">Learning Behavior</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="learningAttitude" className="text-xs text-muted-foreground">
                    learning attitude
                  </Label>
                  <Textarea
                    id="learningAttitude"
                    value={profile.learningAttitude}
                    onChange={(e) => handleFieldChange("learningAttitude", e.target.value)}
                    className="text-sm min-h-[80px] resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cognitiveTraits" className="text-xs text-muted-foreground">
                    cognitive Traits
                  </Label>
                  <Textarea
                    id="cognitiveTraits"
                    value={profile.cognitiveTraits}
                    onChange={(e) => handleFieldChange("cognitiveTraits", e.target.value)}
                    className="text-sm min-h-[100px] resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="historicalBackground" className="text-xs text-muted-foreground">
                    Background
                  </Label>
                  <Textarea
                    id="historicalBackground"
                    value={profile.historicalBackground}
                    onChange={(e) => handleFieldChange("historicalBackground", e.target.value)}
                    className="text-sm min-h-[80px] resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-medium">Goals</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="goal" className="text-xs text-muted-foreground">
                    Goals
                  </Label>
                  <Input
                    id="goal"
                    value={profile.goal}
                    onChange={(e) => handleFieldChange("goal", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="teacherComment" className="text-xs text-muted-foreground">
                    Teacher Comments
                  </Label>
                  <Textarea
                    id="teacherComment"
                    value={profile.teacherComment}
                    onChange={(e) => handleFieldChange("teacherComment", e.target.value)}
                    className="text-sm min-h-[60px] resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="p-3 border-t border-border/40 bg-muted/20">
            <p className="text-xs text-muted-foreground text-center">
              Automatically save changes.
            </p>
          </div>
        </div>
      </aside>
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 z-10 lg:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
}
