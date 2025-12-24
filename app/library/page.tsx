"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Sparkles,
  SlidersHorizontal,
  MessageSquare,
  Bell,
  Settings,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const subscriptions = [
  {
    id: "sub-llm",
    title: "LLM Research Pulse",
    intent: "Track top-tier LLM papers and high-impact benchmarks",
    frequency: "Daily",
    status: "active",
    lastPush: "3 hours ago",
    tags: ["Paper", "Benchmark", "ArXiv"],
  },
  {
    id: "sub-ai-apps",
    title: "AI Product Signals",
    intent: "New AI products, launches, and revenue stories",
    frequency: "2x / week",
    status: "active",
    lastPush: "Yesterday",
    tags: ["Product", "Funding", "GTM"],
  },
  {
    id: "sub-growth",
    title: "Career Growth",
    intent: "Actionable deep dives on career strategy and leadership",
    frequency: "Weekly",
    status: "paused",
    lastPush: "6 days ago",
    tags: ["Leadership", "Career"],
  },
]

const briefs = [
  {
    id: "brief-01",
    topic: "LLM Research Pulse",
    format: "Paper Digest",
    title: "Sparse Expert Routing Reduces Inference Cost by 38%",
    summary:
      "A new routing mechanism for MoE models achieves strong quality while trimming inference time. Key idea: dynamic expert pruning guided by token difficulty.",
    source: "ArXiv",
    score: { relevance: 9.2, authority: 8.7, freshness: 9.5 },
    readTime: "6 min",
    time: "Today",
  },
  {
    id: "brief-02",
    topic: "AI Product Signals",
    format: "Market Brief",
    title: "Agentic Search Startups Shift to Revenue-First Pricing",
    summary:
      "Emerging players are moving away from freemium to seat-based pricing. Adoption spikes among small teams with high task volume.",
    source: "Tech Media",
    score: { relevance: 8.6, authority: 7.9, freshness: 8.3 },
    readTime: "4 min",
    time: "Yesterday",
  },
  {
    id: "brief-03",
    topic: "Career Growth",
    format: "Expert Commentary",
    title: "Decision Journaling for Faster Promotions",
    summary:
      "Leaders who document trade-offs and outcomes build stronger narratives for growth. A lightweight weekly routine is enough to see results.",
    source: "Industry Blog",
    score: { relevance: 8.1, authority: 7.4, freshness: 7.8 },
    readTime: "5 min",
    time: "2 days ago",
  },
]

const recommendations = [
  {
    id: "rec-01",
    title: "AI Regulation Watch",
    reason: "You follow policy discussions in AI product signals.",
  },
  {
    id: "rec-02",
    title: "Frontier Labs Funding",
    reason: "High overlap with your research interest tags.",
  },
]

export default function LibraryPage() {
  const [mode, setMode] = useState<"digest" | "deep">("digest")

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-xl font-semibold text-foreground">SenSight Library</h1>
                <p className="text-xs text-muted-foreground">Intelligent subscriptions for knowledge work</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={mode === "digest" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("digest")}
              >
                Daily Digest
              </Button>
              <Button
                variant={mode === "deep" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("deep")}
              >
                Deep Dive
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <div className="max-w-7xl mx-auto space-y-10">
          <Card className="border-border/60 bg-gradient-to-br from-secondary/10 via-background to-accent/10">
            <CardContent className="p-8">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-foreground">Create a smart subscription</h2>
                      <p className="text-muted-foreground">
                        Describe what you care about. SenSight will search, summarize, and deliver briefings.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">"Track LLM benchmarking papers"</Badge>
                    <Badge variant="secondary">"Weekly AI product launches"</Badge>
                    <Badge variant="secondary">"Fintech regulation updates"</Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-border/60 bg-card p-4">
                    <textarea
                      className="min-h-[120px] w-full resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                      placeholder="Describe your intent, preferred sources, and output style..."
                    />
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-transparent">
                        Paper
                      </Badge>
                      <Badge variant="outline" className="bg-transparent">
                        Market
                      </Badge>
                      <Badge variant="outline" className="bg-transparent">
                        Expert POV
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button className="gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Generate subscription
                    </Button>
                    <Button variant="outline">Use a sample prompt</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-8 lg:grid-cols-[280px_1fr_320px]">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Subscriptions</h3>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Manage
                </Button>
              </div>
              <div className="space-y-4">
                {subscriptions.map((item) => (
                  <Card
                    key={item.id}
                    className="border-border/60 bg-card hover:shadow-lg transition-shadow duration-300"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="text-base font-semibold text-foreground">{item.title}</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">{item.intent}</p>
                        </div>
                        {item.status === "active" ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : (
                          <PauseCircle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{item.frequency}</span>
                        <span>Last push: {item.lastPush}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          Adjust intent
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="toggle subscription">
                          {item.status === "active" ? (
                            <PauseCircle className="h-4 w-4" />
                          ) : (
                            <PlayCircle className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Latest Briefs</h3>
                  <p className="text-sm text-muted-foreground">
                    {mode === "digest" ? "Short, high-signal summaries" : "Long-form collections and analysis"}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Bell className="h-4 w-4" />
                  Alert rules
                </Button>
              </div>

              <div className="space-y-4">
                {briefs.map((brief) => (
                  <Card
                    key={brief.id}
                    className="border-border/60 bg-card hover:shadow-lg transition-shadow duration-300"
                  >
                    <CardContent className="p-5 space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{brief.topic}</Badge>
                        <Badge variant="outline" className="bg-transparent">
                          {brief.format}
                        </Badge>
                        <Badge variant="outline" className="bg-transparent">
                          {brief.source}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-semibold text-foreground">{brief.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{brief.summary}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="secondary">Rel {brief.score.relevance.toFixed(1)}</Badge>
                        <Badge variant="secondary">Auth {brief.score.authority.toFixed(1)}</Badge>
                        <Badge variant="secondary">Fresh {brief.score.freshness.toFixed(1)}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{brief.readTime}</span>
                        <span>{brief.time}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm">Open brief</Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <ThumbsUp className="h-4 w-4" />
                          More like this
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <ThumbsDown className="h-4 w-4" />
                          Less like this
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <aside className="space-y-4">
              <Card className="border-border/60 bg-card">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-primary" />
                    <h4 className="text-base font-semibold text-foreground">Intent & feedback</h4>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Active intent: Keep summaries actionable and decision-focused.</p>
                    <p>Preferred formats: Paper digest, market briefs.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Actionable</Badge>
                    <Badge variant="secondary">High authority</Badge>
                    <Badge variant="secondary">Weekly recap</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Refine intent
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent" />
                    <h4 className="text-base font-semibold text-foreground">Recommended subscriptions</h4>
                  </div>
                  <div className="space-y-3">
                    {recommendations.map((rec) => (
                      <div key={rec.id} className="rounded-lg border border-border/50 p-3">
                        <p className="text-sm font-semibold text-foreground">{rec.title}</p>
                        <p className="text-xs text-muted-foreground">{rec.reason}</p>
                        <Button variant="ghost" size="sm" className="mt-2 w-full">
                          Add subscription
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}
