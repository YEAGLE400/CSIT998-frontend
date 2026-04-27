"use client"

import { Brain, CheckCircle2, ClipboardList, Play, RotateCcw, ShieldCheck, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import type { PracticeAgentRun } from "@/lib/practice-agent-mock"

interface PracticeAgentRunPanelProps {
  run: PracticeAgentRun
  onUseCurrentSet: () => void
  onRetry: () => void
  onBackToSelection: () => void
}

const STAGE_ICONS = {
  plan: ClipboardList,
  generate: Sparkles,
  review: ShieldCheck,
} as const

export function PracticeAgentRunPanel({
  run,
  onUseCurrentSet,
  onRetry,
  onBackToSelection,
}: PracticeAgentRunPanelProps) {
  const activeStage = run.stages.find((stage) => stage.status === "active") ?? run.stages[run.stages.length - 1]
  const ActiveIcon = STAGE_ICONS[activeStage.key]
  const showDecisionActions = run.status === "completed" && Boolean(run.review) && !run.review?.passed
  const showRetryAction = showDecisionActions && run.retryCount < 1
  const planEvidence = run.plan?.evidence ?? []
  const generationPoolStats = run.generationReport?.poolStats ?? []
  const reviewMetrics = run.review?.metrics ?? []

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-gradient-to-br from-primary/5 via-background to-secondary/10">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <Badge variant="secondary">Practice Agent Run</Badge>
              </div>
              <CardTitle className="text-2xl">Generating a personalized practice session</CardTitle>
              <CardDescription>
                The system is running `plan`, `generate`, and `review` with KC signals from the current knowledge graph.
              </CardDescription>
            </div>
            <div className="min-w-[180px] space-y-2 rounded-lg border border-border/50 bg-background/80 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall progress</span>
                <span className="font-medium text-foreground">{run.progress}%</span>
              </div>
              <Progress value={run.progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Focus KC: <span className="font-medium text-foreground">{run.config.sessionPoint.name}</span>
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {run.stages.map((stage) => {
              const Icon = STAGE_ICONS[stage.key]
              const isActive = stage.status === "active"
              const isCompleted = stage.status === "completed"
              return (
                <div
                  key={stage.key}
                  className={`rounded-xl border p-4 transition-all ${
                    isActive
                      ? "border-primary bg-primary/10"
                      : isCompleted
                        ? "border-green-500/30 bg-green-500/10"
                        : "border-border/50 bg-background/70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${isActive ? "text-primary" : isCompleted ? "text-green-600" : "text-muted-foreground"}`} />
                        <span className="font-medium text-foreground">{stage.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{stage.description}</p>
                    </div>
                    <Badge variant={isActive ? "default" : "outline"}>
                      {isCompleted ? "Done" : isActive ? "Running" : "Waiting"}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <ActiveIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>{activeStage.title}</CardTitle>
                <CardDescription>{activeStage.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {run.plan && (
              <div className="space-y-4 rounded-lg border border-border/50 bg-muted/20 p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Planning rationale</p>
                  <p className="text-sm text-muted-foreground">{run.plan.reasoning}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Strategy</p>
                  <div className="space-y-2">
                    {run.plan.strategy.map((item) => (
                      <div key={item} className="rounded-md border border-border/50 bg-background px-3 py-2 text-sm text-muted-foreground">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2 md:grid-cols-3">
                  {planEvidence.map((item) => (
                    <div key={item.label} className="rounded-md border border-border/50 bg-background px-3 py-2">
                      <p className="text-xs font-medium text-foreground">{item.label}: {item.value}</p>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Agent timeline</p>
              <div className="space-y-2">
                {run.timeline.slice(-5).map((event, index) => (
                  <div key={`${event}-${index}`} className="rounded-md border border-border/50 px-3 py-2 text-sm text-muted-foreground">
                    {event}
                  </div>
                ))}
              </div>
            </div>

            {showDecisionActions && (
              <div className="flex flex-col gap-3 pt-2 md:flex-row">
                {showRetryAction && (
                  <Button onClick={onRetry} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Retry Generate + Review
                  </Button>
                )}
                <Button variant="outline" onClick={onUseCurrentSet} className="gap-2">
                  <Play className="h-4 w-4" />
                  Use Current Set
                </Button>
                <Button variant="ghost" onClick={onBackToSelection}>
                  Back to Selection
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle>Structured output</CardTitle>
            <CardDescription>Live artifacts generated by each agent stage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {run.plan && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Plan summary</p>
                  <Badge variant="outline">{run.plan.targetDifficulty}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{run.plan.summary}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{run.plan.quantity} questions</Badge>
                  <Badge variant="secondary">{run.plan.focusKnowledge}</Badge>
                  {run.plan.relatedKnowledge.map((knowledge) => (
                    <Badge key={knowledge} variant="outline">
                      {knowledge}
                    </Badge>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Difficulty mix</p>
                  <div className="flex flex-wrap gap-2">
                    {run.plan.difficultyMix.map((bucket) => (
                      <Badge key={bucket.level} variant="outline">
                        {bucket.level}: {bucket.count}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Generated questions</p>
                <Badge variant="outline">{run.generatedQuestions.length} ready</Badge>
              </div>
              {run.generationReport && (
                <div className="grid gap-2 md:grid-cols-2">
                  {generationPoolStats.slice(0, 4).map((pool) => (
                    <div key={pool.label} className="rounded-md border border-border/50 bg-background px-3 py-2">
                      <p className="text-xs font-medium text-foreground">{pool.label}: {pool.count}</p>
                      <p className="text-xs text-muted-foreground">{pool.detail}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-2">
                {run.generatedQuestions.slice(0, 4).map((question, index) => (
                  <div key={question.id} className="rounded-lg border border-border/50 bg-muted/20 p-3">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-foreground">Q{index + 1}</span>
                      <Badge variant="secondary" className="max-w-[180px] truncate">
                        {question.knowledgePoint || "General"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{question.question}</p>
                  </div>
                ))}
              </div>
            </div>

            {run.review && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">Review result</p>
                    <Badge variant={run.review.passed ? "default" : "destructive"}>
                      Score {run.review.score}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{run.review.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    {reviewMetrics.map((metric) => (
                      <Badge key={metric.label} variant="outline">
                        {metric.label}: {metric.value}
                      </Badge>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {run.review.checks.map((check) => (
                      <div key={check.label} className="flex items-start gap-3 rounded-md border border-border/50 p-3">
                        <CheckCircle2 className={`mt-0.5 h-4 w-4 ${check.passed ? "text-green-600" : "text-destructive"}`} />
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">{check.label}</p>
                          <p className="text-xs text-muted-foreground">{check.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
