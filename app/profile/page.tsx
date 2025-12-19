"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  Brain,
  Calendar,
  Clock,
  Flame,
  MessageSquare,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header with profile info */}
      <div className="border-b border-border/50 bg-card">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary via-secondary to-accent" />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-accent rounded-full flex items-center justify-center border-4 border-card">
                  <Sparkles className="w-4 h-4 text-accent-foreground" />
                </div>
              </div>

              {/* Name and bio */}
              <div className="space-y-3">
                <div>
                  <h1 className="text-3xl font-light text-foreground">Alex Morgan</h1>
                  <p className="text-muted-foreground mt-1">Learning enthusiast</p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Joined March 2024</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-accent" />
                    <span className="font-medium text-foreground">42 day streak</span>
                  </div>
                </div>
              </div>
            </div>

            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12 space-y-12">
        {/* Key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 border-border/50 bg-card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-light text-muted-foreground">Hours in Flow</p>
                <p className="text-4xl font-extralight text-foreground">127</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border/50 bg-card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-light text-muted-foreground">Concepts Mastered</p>
                <p className="text-4xl font-extralight text-foreground">284</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Brain className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border/50 bg-card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-light text-muted-foreground">Speaking Fluency</p>
                <p className="text-4xl font-extralight text-foreground">78%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-accent" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border/50 bg-card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-light text-muted-foreground">Growth Score</p>
                <p className="text-4xl font-extralight text-foreground">A+</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-chart-4/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-chart-4" />
              </div>
            </div>
          </Card>
        </div>

        {/* Knowledge Galaxy */}
        <Card className="p-8 border-border/50 bg-card">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-light text-foreground">Knowledge Galaxy</h2>
                <p className="text-sm text-muted-foreground mt-1">Your mastered topics visualized</p>
              </div>
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </div>

            {/* Galaxy visualization - simplified circles representation */}
            <div className="relative h-80 rounded-2xl bg-gradient-to-br from-muted/30 via-background to-muted/50 overflow-hidden">
              {/* Center large topic */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-br from-primary/60 to-primary/40 flex items-center justify-center backdrop-blur-sm border border-primary/30 shadow-2xl shadow-primary/20">
                <div className="text-center">
                  <Brain className="w-8 h-8 text-white mx-auto mb-1" />
                  <p className="text-xs font-medium text-white">Machine Learning</p>
                </div>
              </div>

              {/* Orbiting topics */}
              <div className="absolute top-[20%] left-[25%] w-20 h-20 rounded-full bg-gradient-to-br from-secondary/60 to-secondary/40 flex items-center justify-center backdrop-blur-sm border border-secondary/30 shadow-lg">
                <div className="text-center">
                  <Target className="w-5 h-5 text-white mx-auto" />
                  <p className="text-[10px] font-medium text-white mt-0.5">Calculus</p>
                </div>
              </div>

              <div className="absolute top-[60%] left-[15%] w-24 h-24 rounded-full bg-gradient-to-br from-accent/60 to-accent/40 flex items-center justify-center backdrop-blur-sm border border-accent/30 shadow-lg">
                <div className="text-center">
                  <BookOpen className="w-6 h-6 text-white mx-auto" />
                  <p className="text-[11px] font-medium text-white mt-0.5">Literature</p>
                </div>
              </div>

              <div className="absolute top-[25%] right-[20%] w-28 h-28 rounded-full bg-gradient-to-br from-chart-4/60 to-chart-4/40 flex items-center justify-center backdrop-blur-sm border border-chart-4/30 shadow-lg">
                <div className="text-center">
                  <Zap className="w-7 h-7 text-white mx-auto" />
                  <p className="text-xs font-medium text-white mt-1">Physics</p>
                </div>
              </div>

              <div className="absolute bottom-[20%] right-[25%] w-20 h-20 rounded-full bg-gradient-to-br from-chart-5/60 to-chart-5/40 flex items-center justify-center backdrop-blur-sm border border-chart-5/30 shadow-lg">
                <div className="text-center">
                  <MessageSquare className="w-5 h-5 text-white mx-auto" />
                  <p className="text-[10px] font-medium text-white mt-0.5">Spanish</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Learning Heatmap & Mindset */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Learning Heatmap */}
          <Card className="p-8 border-border/50 bg-card">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-light text-foreground">Learning Heatmap</h2>
                <p className="text-sm text-muted-foreground mt-1">Your activity over the past 3 months</p>
              </div>

              <div className="space-y-2">
                {["Mon", "Wed", "Fri", "Sun"].map((day, dayIdx) => (
                  <div key={day} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-8">{day}</span>
                    <div className="flex gap-1 flex-1">
                      {Array.from({ length: 12 }).map((_, idx) => {
                        const intensity = Math.random()
                        return (
                          <div
                            key={idx}
                            className="flex-1 aspect-square rounded-sm"
                            style={{
                              backgroundColor:
                                intensity > 0.7
                                  ? "oklch(0.55 0.15 240)"
                                  : intensity > 0.4
                                    ? "oklch(0.75 0.1 240)"
                                    : intensity > 0.2
                                      ? "oklch(0.85 0.05 240)"
                                      : "oklch(0.96 0.005 240)",
                            }}
                          />
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-4">
                <span className="text-xs text-muted-foreground">Less</span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className="w-4 h-4 rounded-sm"
                      style={{
                        backgroundColor:
                          level === 0
                            ? "oklch(0.96 0.005 240)"
                            : level === 1
                              ? "oklch(0.85 0.05 240)"
                              : level === 2
                                ? "oklch(0.75 0.1 240)"
                                : level === 3
                                  ? "oklch(0.65 0.13 240)"
                                  : "oklch(0.55 0.15 240)",
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">More</span>
              </div>
            </div>
          </Card>

          {/* Mindset Section */}
          <Card className="p-8 border-border/50 bg-card">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-light text-foreground">Your Mindset</h2>
                <p className="text-sm text-muted-foreground mt-1">AI-generated insights about your learning habits</p>
              </div>

              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground mb-1">Consistent Learner</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        You've maintained a strong daily habit, showing dedication and discipline in your learning
                        journey.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground mb-1">Deep Thinker</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        You prefer spending longer sessions understanding concepts thoroughly rather than rushing
                        through material.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/20">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Target className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground mb-1">Curious Explorer</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Your diverse topic selection shows intellectual curiosity and a love for interdisciplinary
                        learning.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity Timeline */}
        <Card className="p-8 border-border/50 bg-card">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-light text-foreground">Recent Activity</h2>
              <p className="text-sm text-muted-foreground mt-1">Your learning journey over the past week</p>
            </div>

            <div className="space-y-6">
              {[
                {
                  icon: Brain,
                  title: "Completed Advanced Calculus challenge",
                  time: "2 hours ago",
                  color: "primary",
                },
                {
                  icon: MessageSquare,
                  title: "Spanish conversation session - 15 minutes",
                  time: "5 hours ago",
                  color: "secondary",
                },
                {
                  icon: BookOpen,
                  title: 'Read "Quantum Physics Fundamentals"',
                  time: "Yesterday",
                  color: "accent",
                },
                {
                  icon: Target,
                  title: "Mastered 5 new Machine Learning concepts",
                  time: "2 days ago",
                  color: "chart-4",
                },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg bg-${activity.color}/10 flex items-center justify-center flex-shrink-0`}
                  >
                    <activity.icon className={`w-5 h-5 text-${activity.color}`} />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-foreground font-normal">{activity.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
