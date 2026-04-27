"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, ClipboardList, ShieldCheck, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { PracticeAgentRun } from "@/lib/practice-agent-mock"

type RetrospectiveStage = "plan" | "generate" | "review"

interface PracticeAgentRetrospectivePanelProps {
  run: PracticeAgentRun
}

const STAGE_META = {
  plan: {
    title: "Plan Agent",
    description: "Session strategy and KC targeting",
    icon: ClipboardList,
  },
  generate: {
    title: "Generate Agent",
    description: "Question set assembled for the learner",
    icon: Sparkles,
  },
  review: {
    title: "Review Agent",
    description: "Fluency, difficulty, novelty, quantity, and repetition checks",
    icon: ShieldCheck,
  },
} as const

export function PracticeAgentRetrospectivePanel({ run }: PracticeAgentRetrospectivePanelProps) {
  const [selectedStage, setSelectedStage] = useState<RetrospectiveStage>(
    run.currentStage === "generate" || run.currentStage === "review" ? run.currentStage : "plan"
  )

  useEffect(() => {
    if (run.currentStage === "generate" || run.currentStage === "review") {
      setSelectedStage(run.currentStage)
    }
  }, [run.currentStage])

  const selectedStageInfo = run.stages.find((stage) => stage.key === selectedStage)
  const planEvidence = run.plan?.evidence ?? []
  const planConstraints = run.plan?.constraints ?? []
  const generationPoolStats = run.generationReport?.poolStats ?? []
  const generationSelectionNotes = run.generationReport?.selectionNotes ?? []
  const generationDiversityNotes = run.generationReport?.diversityNotes ?? []
  const reviewMetrics = run.review?.metrics ?? []

  return (
    <div className="space-y-5">
      <Card className="border-border/50 bg-linear-to-br from-primary/5 via-background to-secondary/10">
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle>Generation Process</CardTitle>
              <CardDescription>
                Review the agent run that created this practice session.
              </CardDescription>
            </div>
            <Badge variant={run.status === "completed" ? "default" : "secondary"}>
              {run.progress}%
            </Badge>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {(Object.keys(STAGE_META) as RetrospectiveStage[]).map((stageKey) => {
              const meta = STAGE_META[stageKey]
              const Icon = meta.icon
              const stage = run.stages.find((item) => item.key === stageKey)
              const isSelected = selectedStage === stageKey

              return (
                <Button
                  key={stageKey}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  className="h-auto justify-start gap-3 p-3 text-left"
                  onClick={() => setSelectedStage(stageKey)}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{meta.title}</span>
                    <span className="block text-xs opacity-80">{stage?.status ?? "pending"}</span>
                  </span>
                </Button>
              )
            })}
          </div>
        </CardHeader>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            {selectedStageInfo?.status === "completed" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
            <CardTitle>{STAGE_META[selectedStage].title}</CardTitle>
          </div>
          <CardDescription>{STAGE_META[selectedStage].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedStage === "plan" && (
            run.plan ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Plan summary</p>
                  <p className="text-sm text-muted-foreground">{run.plan.summary}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Badge variant="secondary">{run.plan.quantity} questions</Badge>
                  <Badge variant="outline">{run.plan.targetDifficulty}</Badge>
                  <Badge variant="outline">{run.plan.focusKnowledge}</Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Evidence</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {planEvidence.map((item) => (
                      <div key={item.label} className="rounded-md border border-border/50 bg-muted/20 px-3 py-2">
                        <p className="text-xs font-medium text-foreground">{item.label}: {item.value}</p>
                        <p className="text-xs text-muted-foreground">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Reasoning</p>
                  <p className="text-sm text-muted-foreground">{run.plan.reasoning}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Constraints</p>
                  <div className="flex flex-wrap gap-2">
                    {planConstraints.map((item) => (
                      <Badge key={item} variant="outline">
                        {item}
                      </Badge>
                    ))}
                  </div>
                  {run.plan.alternativeApproach && (
                    <p className="text-xs text-muted-foreground">{run.plan.alternativeApproach}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Strategy</p>
                  {run.plan.strategy.map((item) => (
                    <div key={item} className="rounded-md border border-border/50 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Plan output is still being prepared.</p>
            )
          )}

          {selectedStage === "generate" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Generated questions</p>
                <Badge variant="outline">{run.generatedQuestions.length} ready</Badge>
              </div>
              {run.generationReport && (
                <div className="space-y-4">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {generationPoolStats.map((pool) => (
                      <div key={pool.label} className="rounded-md border border-border/50 bg-muted/20 px-3 py-2">
                        <p className="text-xs font-medium text-foreground">{pool.label}: {pool.count}</p>
                        <p className="text-xs text-muted-foreground">{pool.detail}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Selection notes</p>
                    {generationSelectionNotes.map((note) => (
                      <div key={note} className="rounded-md border border-border/50 px-3 py-2 text-sm text-muted-foreground">
                        {note}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {generationDiversityNotes.map((note) => (
                      <Badge key={note} variant="outline">
                        {note}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {run.generatedQuestions.length > 0 ? (
                <div className="space-y-2">
                  {run.generatedQuestions.map((question, index) => (
                    <div key={question.id} className="rounded-lg border border-border/50 bg-muted/20 p-3">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-foreground">Q{index + 1}</span>
                        <Badge variant="secondary" className="max-w-55 truncate">
                          {question.knowledgePoint || "General"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{question.question}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Generate output is not ready yet.</p>
              )}
            </div>
          )}

          {selectedStage === "review" && (
            run.review ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">{run.review.summary}</p>
                  <Badge variant={run.review.passed ? "default" : "destructive"}>Score {run.review.score}</Badge>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {reviewMetrics.map((metric) => (
                    <div key={metric.label} className="rounded-md border border-border/50 bg-muted/20 px-3 py-2">
                      <p className="text-xs font-medium text-foreground">{metric.label}: {metric.value}</p>
                      <p className="text-xs text-muted-foreground">{metric.detail}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {run.review.checks.map((check) => (
                    <div key={check.label} className="rounded-md border border-border/50 p-3">
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-foreground">{check.label}</p>
                        <Badge variant={check.passed ? "default" : "destructive"}>
                          {check.passed ? "Passed" : "Risk"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{check.detail}</p>
                    </div>
                  ))}
                </div>
                <Separator />
                <p className="text-sm text-muted-foreground">{run.review.recommendedAction}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Review output is still waiting for generated questions.</p>
            )
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Agent Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {run.timeline.map((event, index) => (
            <div key={`${event}-${index}`} className="rounded-md border border-border/50 px-3 py-2 text-sm text-muted-foreground">
              {event}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
