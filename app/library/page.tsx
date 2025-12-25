"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Sparkles,
  MessageSquare,
  Bell,
  Settings,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

const initialSubscriptions = [
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

const initialBriefs: Array<{
  id: string
  title: string
  summary: string
  tags: string[]
  readTime: string
  source: string
  sourceUrl: string
  createdAt: string
  isRelevant?: boolean
  keywords?: string[]
  pdfUrl?: string
  originalTextPreview?: string
}> = []

export default function LibraryPage() {
  const [mode, setMode] = useState<"digest" | "deep">("digest")
  const [intentInput, setIntentInput] = useState("")
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions)
  const [briefs, setBriefs] = useState(initialBriefs)
  const [feedback, setFeedback] = useState<Record<string, "up" | "down" | null>>({})
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused">("all")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [detailsId, setDetailsId] = useState<string | null>(null)
  const [showManagePanel, setShowManagePanel] = useState(false)
  const [briefsLoading, setBriefsLoading] = useState(false)
  const [briefsError, setBriefsError] = useState<string | null>(null)
  const [selectedBriefId, setSelectedBriefId] = useState<string | null>(null)
  const [detailsDraft, setDetailsDraft] = useState({
    title: "",
    intent: "",
    frequency: "Weekly",
  })
  const [toast, setToast] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const samplePrompts = [
    "Track LLM benchmarking papers and new evaluation datasets.",
    "Weekly AI product launches and early revenue signals.",
    "Career growth insights for tech leads and managers.",
  ]

  const activeCount = useMemo(
    () => subscriptions.filter((item) => item.status === "active").length,
    [subscriptions]
  )
  const filteredSubscriptions = useMemo(() => {
    const lowered = query.trim().toLowerCase()
    return subscriptions.filter((item) => {
      const matchesQuery =
        lowered.length === 0 ||
        item.title.toLowerCase().includes(lowered) ||
        item.intent.toLowerCase().includes(lowered)
      const matchesStatus = statusFilter === "all" || item.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [query, statusFilter, subscriptions])
  const allFilteredSelected =
    filteredSubscriptions.length > 0 &&
    filteredSubscriptions.every((item) => selectedIds.includes(item.id))

  const showToast = (type: "success" | "error", message: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }
    setToast({ type, message })
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3000)
  }

  const keywords = useMemo(() => {
    const tokens = new Set<string>()
    subscriptions.forEach((item) => {
      if (item.status !== "active") return
      item.tags.forEach((tag) => tokens.add(tag))
      item.title
        .split(/[\s,/.-]+/)
        .map((word) => word.trim())
        .filter((word) => word.length >= 3)
        .forEach((word) => tokens.add(word))
    })
    return Array.from(tokens).slice(0, 20)
  }, [subscriptions])

  useEffect(() => {
    const controller = new AbortController()
    const loadBriefs = async () => {
      setBriefsLoading(true)
      setBriefsError(null)
      try {
        const response = await fetch("http://localhost:8080/api/library/briefs/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keywords, limit: 50 }),
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`)
        }
        const data = await response.json()
        setBriefs(Array.isArray(data.items) ? data.items : [])
      } catch (error) {
        if ((error as { name?: string }).name === "AbortError") return
        setBriefsError("Failed to load briefs.")
        showToast("error", "Failed to load briefs.")
      } finally {
        setBriefsLoading(false)
      }
    }
    loadBriefs()
    return () => controller.abort()
  }, [keywords])

  const handleCreateSubscription = () => {
    const trimmed = intentInput.trim()
    if (!trimmed) {
      showToast("error", "Please enter a subscription intent first.")
      return
    }

    const title =
      trimmed.length > 44 ? `${trimmed.slice(0, 41).trim()}...` : trimmed

    const newSubscription = {
      id: `sub-${Date.now()}`,
      title,
      intent: trimmed,
      frequency: "Weekly",
      status: "active" as const,
      lastPush: "Just now",
      tags: ["Custom"],
    }

    setSubscriptions((prev) => [newSubscription, ...prev])
    setIntentInput("")
    showToast("success", "Subscription created successfully.")
  }

  const handleToggleSubscription = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "active" ? "paused" : "active",
            }
          : item
      )
    )
  }

  const handleFeedback = (id: string, value: "up" | "down") => {
    setFeedback((prev) => ({ ...prev, [id]: prev[id] === value ? null : value }))
  }

  const handleOpenBrief = (url?: string) => {
    if (!url) {
      showToast("error", "No source link available.")
      return
    }
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const selectedBrief = useMemo(
    () => briefs.find((item) => item.id === selectedBriefId) || null,
    [briefs, selectedBriefId]
  )

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      const filteredIds = new Set(filteredSubscriptions.map((item) => item.id))
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.has(id)))
      return
    }
    setSelectedIds((prev) => {
      const next = new Set(prev)
      filteredSubscriptions.forEach((item) => next.add(item.id))
      return Array.from(next)
    })
  }

  const handleBatchPause = () => {
    if (selectedIds.length === 0) {
      showToast("error", "Select at least one subscription.")
      return
    }
    const selected = new Set(selectedIds)
    setSubscriptions((prev) =>
      prev.map((item) => (selected.has(item.id) ? { ...item, status: "paused" } : item))
    )
    showToast("success", "Selected subscriptions paused.")
  }

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) {
      showToast("error", "Select at least one subscription.")
      return
    }
    const selected = new Set(selectedIds)
    setSubscriptions((prev) => prev.filter((item) => !selected.has(item.id)))
    setSelectedIds([])
    showToast("success", "Selected subscriptions deleted.")
  }

  const handleDeleteSubscription = (id: string) => {
    setSubscriptions((prev) => prev.filter((item) => item.id !== id))
    setSelectedIds((prev) => prev.filter((item) => item !== id))
    showToast("success", "Subscription deleted.")
  }

  const handleOpenDetails = (id: string) => {
    const target = subscriptions.find((item) => item.id === id)
    if (!target) return
    setDetailsDraft({
      title: target.title,
      intent: target.intent,
      frequency: target.frequency,
    })
    setDetailsId(id)
  }

  const handleCloseDetails = () => {
    setDetailsId(null)
  }

  const handleSaveDetails = () => {
    if (!detailsId) return
    const title = detailsDraft.title.trim()
    const intent = detailsDraft.intent.trim()
    if (!title || !intent) {
      showToast("error", "Title and intent are required.")
      return
    }
    setSubscriptions((prev) =>
      prev.map((item) =>
        item.id === detailsId
          ? {
              ...item,
              title,
              intent,
              frequency: detailsDraft.frequency,
            }
          : item
      )
    )
    setDetailsId(null)
    showToast("success", "Subscription updated.")
  }

  const handleUseSample = () => {
    const pick = samplePrompts[Math.floor(Math.random() * samplePrompts.length)]
    setIntentInput(pick)
  }

  const clampSummary = (text: string) =>
    mode === "digest" && text.length > 160 ? `${text.slice(0, 157)}...` : text
  const formatDate = (value: string) => {
    if (!value) return "Just now"
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value
    return parsed.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-background">
      {toast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div
            className={`rounded-2xl border px-6 py-4 text-base shadow-xl ${
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-rose-200 bg-rose-50 text-rose-900"
            }`}
            role="status"
            aria-live="polite"
          >
            {toast.message}
          </div>
        </div>
      )}
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
                      value={intentInput}
                      onChange={(event) => setIntentInput(event.target.value)}
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
                    <Button className="gap-2" onClick={handleCreateSubscription}>
                      <MessageSquare className="h-4 w-4" />
                      Generate subscription
                    </Button>
                    <Button variant="outline" onClick={handleUseSample}>
                      Use a sample prompt
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  Subscriptions ({activeCount} active)
                </h3>
                <Button
                  variant={showManagePanel ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowManagePanel((prev) => !prev)}
                >
                  <Settings className="h-4 w-4" />
                  Manage
                </Button>
              </div>
              <div className="space-y-3 rounded-xl border border-border/60 bg-card p-4">
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search subscriptions..."
                />
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="h-9 rounded-md border border-border/60 bg-background px-3 text-sm text-foreground"
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value as "all" | "active" | "paused")
                    }
                  >
                    <option value="all">All status</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                  </select>
                  {showManagePanel && (
                    <>
                      <Button size="sm" variant="outline" onClick={handleBatchPause}>
                        Pause selected
                      </Button>
                      <Button size="sm" variant="destructive" onClick={handleBatchDelete}>
                        Delete selected
                      </Button>
                    </>
                  )}
                </div>
                {showManagePanel && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={allFilteredSelected}
                        onChange={handleToggleSelectAll}
                      />
                      Select all
                    </label>
                    <span>{selectedIds.length} selected</span>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {filteredSubscriptions.length === 0 && (
                  <Card className="border-dashed border-border/60 bg-card">
                    <CardContent className="p-6 text-sm text-muted-foreground">
                      No subscriptions match your filters.
                    </CardContent>
                  </Card>
                )}
                {filteredSubscriptions.map((item) => (
                  <Card
                    key={item.id}
                    className="border-border/60 bg-card hover:shadow-lg transition-shadow duration-300"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          {showManagePanel && (
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(item.id)}
                              onChange={() => handleToggleSelect(item.id)}
                            />
                          )}
                          <div className="space-y-1">
                            <h4 className="text-base font-semibold text-foreground">{item.title}</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">{item.intent}</p>
                          </div>
                        </div>
                        <div className="pt-1">
                          {item.status === "active" ? (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          ) : (
                            <PauseCircle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
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
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenDetails(item.id)}>
                          View & edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="toggle subscription"
                          onClick={() => handleToggleSubscription(item.id)}
                        >
                          {item.status === "active" ? (
                            <PauseCircle className="h-4 w-4" />
                          ) : (
                            <PlayCircle className="h-4 w-4" />
                          )}
                        </Button>
                        {showManagePanel && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-rose-500 hover:text-rose-600"
                            aria-label="delete subscription"
                            onClick={() => handleDeleteSubscription(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
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

              <div className="columns-1 gap-6 md:columns-2 xl:columns-3 [column-fill:_balance]">
                {briefsLoading && (
                  <Card className="border-border/60 bg-card">
                    <CardContent className="p-5 text-sm text-muted-foreground">
                      Loading briefs...
                    </CardContent>
                  </Card>
                )}
                {briefsError && !briefsLoading && (
                  <Card className="border-border/60 bg-card">
                    <CardContent className="p-5 text-sm text-muted-foreground">
                      {briefsError}
                    </CardContent>
                  </Card>
                )}
                {!briefsLoading && !briefsError && briefs.length === 0 && (
                  <Card className="border-border/60 bg-card">
                    <CardContent className="p-5 text-sm text-muted-foreground">
                      No briefs available yet.
                    </CardContent>
                  </Card>
                )}
                {!briefsLoading &&
                  !briefsError &&
                  briefs.map((brief) => (
                  <Card
                    key={brief.id}
                    className="mb-6 cursor-pointer border-border/60 bg-card hover:shadow-lg transition-shadow duration-300"
                    style={{ breakInside: "avoid" }}
                    onClick={() => setSelectedBriefId(brief.id)}
                  >
                    <CardContent className="p-5 space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {brief.isRelevant && <Badge variant="secondary">Relevant</Badge>}
                        {brief.tags?.slice(0, 2).map((tag) => (
                          <Badge key={`${brief.id}-${tag}`} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                        <Badge variant="outline" className="bg-transparent">
                          {brief.source}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-semibold text-foreground">{brief.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {clampSummary(brief.summary)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{brief.readTime}</span>
                        <span>{formatDate(brief.createdAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

          </div>
        </div>
      </main>
      {detailsId && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={handleCloseDetails} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-2xl">
            <div className="flex h-full flex-col">
              <div className="border-b border-border/60 px-6 py-4">
                <h3 className="text-lg font-semibold text-foreground">Subscription details</h3>
                <p className="text-xs text-muted-foreground">View and edit subscription settings.</p>
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Title</label>
                  <Input
                    value={detailsDraft.title}
                    onChange={(event) =>
                      setDetailsDraft((prev) => ({ ...prev, title: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Intent</label>
                  <textarea
                    value={detailsDraft.intent}
                    onChange={(event) =>
                      setDetailsDraft((prev) => ({ ...prev, intent: event.target.value }))
                    }
                    className="min-h-[120px] w-full resize-none rounded-md border border-border/60 bg-background px-3 py-2 text-sm text-foreground outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Frequency</label>
                  <select
                    className="h-10 w-full rounded-md border border-border/60 bg-background px-3 text-sm text-foreground"
                    value={detailsDraft.frequency}
                    onChange={(event) =>
                      setDetailsDraft((prev) => ({ ...prev, frequency: event.target.value }))
                    }
                  >
                    <option value="Daily">Daily</option>
                    <option value="2x / week">2x / week</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div className="border-t border-border/60 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Button className="flex-1" onClick={handleSaveDetails}>
                    Save changes
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={handleCloseDetails}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedBrief && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedBriefId(null)} />
          <div className="absolute left-1/2 top-1/2 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background shadow-2xl">
            <div className="border-b border-border/60 px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{selectedBrief.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedBrief.source} • {formatDate(selectedBrief.createdAt)} • {selectedBrief.readTime}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedBriefId(null)}>
                  Close
                </Button>
              </div>
            </div>
            <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-6">
              <div className="flex flex-wrap gap-2">
                {selectedBrief.isRelevant && <Badge variant="secondary">Relevant</Badge>}
                {selectedBrief.tags?.map((tag) => (
                  <Badge key={`${selectedBrief.id}-${tag}`} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="space-y-2">
                <h4 className="text-base font-semibold text-foreground">Summary</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedBrief.summary}</p>
              </div>
              {selectedBrief.keywords && selectedBrief.keywords.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-foreground">Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBrief.keywords.map((keyword) => (
                      <Badge key={`${selectedBrief.id}-${keyword}`} variant="outline" className="bg-transparent">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedBrief.originalTextPreview && (
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-foreground">Original preview</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedBrief.originalTextPreview}
                  </p>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => handleOpenBrief(selectedBrief.sourceUrl)}>
                  Open source
                </Button>
                {selectedBrief.pdfUrl && (
                  <Button size="sm" variant="outline" onClick={() => handleOpenBrief(selectedBrief.pdfUrl)}>
                    Open PDF
                  </Button>
                )}
                <Button
                  variant={feedback[selectedBrief.id] === "up" ? "default" : "outline"}
                  size="sm"
                  className="gap-2"
                  onClick={() => handleFeedback(selectedBrief.id, "up")}
                >
                  <ThumbsUp className="h-4 w-4" />
                  More like this
                </Button>
                <Button
                  variant={feedback[selectedBrief.id] === "down" ? "destructive" : "ghost"}
                  size="sm"
                  className="gap-2"
                  onClick={() => handleFeedback(selectedBrief.id, "down")}
                >
                  <ThumbsDown className="h-4 w-4" />
                  Less like this
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
