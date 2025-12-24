"use client"

import Link from "next/link"
import { History, Sparkles, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function PracticePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {/* Page Title */}
            <div className="text-center space-y-2 mb-12">
              <h1 className="text-4xl font-bold text-foreground">Practice</h1>
              <p className="text-muted-foreground">Choose an option to continue</p>
            </div>

            {/* Two Main Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Practice Records Panel */}
              <Card className="border-border/50 bg-card hover:shadow-lg transition-all duration-300 group overflow-hidden">
                <Link href="/practice/records">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="flex items-center justify-center">
                        <div className="h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <History className="h-12 w-12 text-primary" />
                        </div>
                      </div>
                      <div className="text-center space-y-2">
                        <h2 className="text-2xl font-semibold text-foreground">Practice Records</h2>
                        <p className="text-sm text-muted-foreground">
                          View your practice history and track your progress
                        </p>
                      </div>
                      <Button className="w-full gap-2" size="lg">
                        View Records
                        <History className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Link>
                </Card>

              {/* Problem Generation */}
              <Card className="border-border/50 bg-card hover:shadow-lg transition-all duration-300 group overflow-hidden">
                <Link href="/practice/generate">
            <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="flex items-center justify-center">
                        <div className="h-24 w-24 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                          <Sparkles className="h-12 w-12 text-secondary" />
                </div>
                      </div>
                      <div className="text-center space-y-2">
                        <h2 className="text-2xl font-semibold text-foreground">Generate Problems</h2>
                        <p className="text-sm text-muted-foreground">
                          Create new practice problems tailored to your needs
                        </p>
                      </div>
                      <Button className="w-full gap-2" size="lg" variant="secondary">
                        Generate Problems
                        <Sparkles className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
