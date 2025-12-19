import Link from "next/link"
import { ArrowLeft, Brain, Clock, TrendingUp, RefreshCw, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function PracticePage() {
  const challenges = [
    {
      id: 1,
      subject: "Mathematics",
      topic: "Quadratic Equations",
      difficulty: "Medium",
      estimatedTime: "15 min",
      description: "Solve complex quadratic equations using the quadratic formula and factoring methods.",
      icon: "📐",
    },
    {
      id: 2,
      subject: "Physics",
      topic: "Newton's Laws",
      difficulty: "Easy",
      estimatedTime: "10 min",
      description: "Apply Newton's three laws of motion to real-world scenarios and calculate forces.",
      icon: "⚡",
    },
    {
      id: 3,
      subject: "Literature",
      topic: "Literary Analysis",
      difficulty: "Hard",
      estimatedTime: "20 min",
      description: "Analyze themes, symbolism, and narrative techniques in classic literature.",
      icon: "📚",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
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
              <h1 className="text-xl font-semibold text-foreground">Daily Growth Path</h1>
            </div>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <RefreshCw className="h-4 w-4" />
              Refresh Challenges
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Introduction */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                <Brain className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground">Personalized Challenges</h2>
                <p className="text-muted-foreground">Curated problems tailored to your learning journey</p>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border/50 bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Problems Solved</p>
                    <p className="text-3xl font-bold text-foreground">47</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Current Streak</p>
                    <p className="text-3xl font-bold text-foreground">12 days</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                    <p className="text-3xl font-bold text-foreground">89%</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <Brain className="h-6 w-6 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Today's Challenges */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-foreground">Today's Challenges</h3>
              <p className="text-sm text-muted-foreground">3 problems curated for you</p>
            </div>

            <div className="space-y-4">
              {challenges.map((challenge, index) => (
                <Card
                  key={challenge.id}
                  className="border-border/50 bg-card hover:shadow-lg transition-all duration-300 group cursor-pointer overflow-hidden"
                >
                  <CardContent className="p-0">
                    <div className="flex items-stretch">
                      {/* Challenge Number */}
                      <div className="w-20 bg-muted/30 flex items-center justify-center border-r border-border/50">
                        <span className="text-2xl font-bold text-muted-foreground/60">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>

                      {/* Challenge Content */}
                      <div className="flex-1 p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{challenge.icon}</span>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-lg font-semibold text-foreground">{challenge.topic}</h4>
                                  <Badge
                                    variant="secondary"
                                    className={
                                      challenge.difficulty === "Easy"
                                        ? "bg-secondary/20 text-secondary"
                                        : challenge.difficulty === "Medium"
                                          ? "bg-primary/20 text-primary"
                                          : "bg-accent/20 text-accent"
                                    }
                                  >
                                    {challenge.difficulty}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{challenge.subject}</p>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">{challenge.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{challenge.estimatedTime}</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <Button className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors gap-2">
                            Start Challenge
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Progress Insight */}
          <Card className="border-border/50 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="h-16 w-16 rounded-2xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-accent" />
                </div>
                <div className="space-y-2 flex-1">
                  <h4 className="text-xl font-semibold text-foreground">You're making great progress!</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Based on your recent performance, we've noticed you're excelling in algebraic concepts. Consider
                    exploring more advanced calculus problems to continue your growth trajectory.
                  </p>
                </div>
                <Button variant="outline" className="flex-shrink-0 bg-transparent">
                  View Insights
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
