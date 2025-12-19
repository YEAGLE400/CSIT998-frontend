import Link from "next/link"
import { Search, Sparkles, Brain, BookOpen, MessageSquare, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MentorBubble } from "@/components/mentor-bubble"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold text-foreground">Aura Learning</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/practice" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Practice
              </Link>
              <Link href="/solver" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Solver
              </Link>
              <Link href="/library" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Library
              </Link>
              <Link href="/speak" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Speak
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="shadow-sm">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-24 pb-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight text-balance leading-tight">
              Learning that understands you
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              Experience AI-powered education that adapts to your journey. Personalized challenges, intelligent
              guidance, and a mentor that grows with you.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto pt-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                className="h-14 pl-12 pr-4 text-lg bg-card shadow-lg border-border/50 rounded-2xl focus-visible:ring-primary"
                placeholder="Ask any question to begin your journey..."
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Button variant="secondary" size="sm" className="rounded-full">
              <Brain className="h-4 w-4 mr-2" />
              Generate Practice Problems
            </Button>
            <Button variant="secondary" size="sm" className="rounded-full">
              <BookOpen className="h-4 w-4 mr-2" />
              Explore Topics
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
              Six ways we support your growth
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              A comprehensive platform designed around how humans actually learn
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Link href="/practice">
              <div className="group bg-card rounded-2xl p-8 border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Brain className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Personalized Challenges</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Daily curated problems tailored to your growth path. Focus on what matters, not on feeling
                    overwhelmed.
                  </p>
                </div>
              </div>
            </Link>

            {/* Feature 2 */}
            <Link href="/solver">
              <div className="group bg-card rounded-2xl p-8 border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Smart Problem Solver</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Step-by-step guidance that illuminates the path, not just the answer. Understand the why behind
                    every solution.
                  </p>
                </div>
              </div>
            </Link>

            {/* Feature 3 */}
            <Link href="/dashboard">
              <div className="group bg-card rounded-2xl p-8 border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageSquare className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Proactive Mentor</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Gentle nudges when you need them. An AI that notices patterns and suggests helpful interventions.
                  </p>
                </div>
              </div>
            </Link>

            {/* Feature 4 */}
            <Link href="/library">
              <div className="group bg-card rounded-2xl p-8 border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Curated Knowledge</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Subscribe to topics that matter. A premium feed of insights delivered like a digital magazine.
                  </p>
                </div>
              </div>
            </Link>

            {/* Feature 5 */}
            <Link href="/speak">
              <div className="group bg-card rounded-2xl p-8 border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Voice Training</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Practice language skills through natural conversation. A rhythm-first interface that feels human.
                  </p>
                </div>
              </div>
            </Link>

            {/* Feature 6 */}
            <Link href="/dashboard">
              <div className="group bg-card rounded-2xl p-8 border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Unified Dashboard</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    See your learning state at a glance. All modules harmonized in one beautiful, airy workspace.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-3xl p-12 text-center space-y-6 border border-border/50">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">Ready to begin your journey?</h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Join thousands of learners discovering a more human approach to education
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/auth/signup">
              <Button size="lg" className="text-base shadow-lg">
                Start Learning Free
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="text-base bg-transparent">
                See How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 mt-24">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Aura Learning</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <Link href="/about" className="hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/pricing" className="hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">
                Contact
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <MentorBubble />
    </div>
  )
}
