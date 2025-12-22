"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, History, CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PracticeRecord {
  id: string
  topic: string
  difficulty: string
  totalQuestions: number
  correctAnswers: number
  accuracy: number
  timeSpent: number
  date: string
  questions: Array<{
    id: string
    question: string
    userAnswer: string
    correctAnswer: string
    isCorrect: boolean
  }>
}

export default function PracticeRecordsPage() {
  const [records, setRecords] = useState<PracticeRecord[]>([])

  useEffect(() => {
    // Load records from localStorage
    const storedRecords = localStorage.getItem("practiceRecords")
    if (storedRecords) {
      try {
        const parsed = JSON.parse(storedRecords)
        setRecords(parsed)
      } catch (error) {
        console.error("Failed to parse practice records:", error)
      }
    }
  }, [])

  const stats = {
    totalPractices: records.length,
    totalQuestions: records.reduce((sum, r) => sum + r.totalQuestions, 0),
    totalCorrect: records.reduce((sum, r) => sum + r.correctAnswers, 0),
    averageAccuracy:
      records.length > 0
        ? Math.round(records.reduce((sum, r) => sum + r.accuracy, 0) / records.length)
        : 0,
    totalTime: records.reduce((sum, r) => sum + r.timeSpent, 0),
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/practice">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">Practice Records</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-border/50 bg-card">
              <CardContent className="p-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Practices</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalPractices}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card">
              <CardContent className="p-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Questions</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalQuestions}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card">
              <CardContent className="p-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Average Accuracy</p>
                  <p className="text-3xl font-bold text-foreground">{stats.averageAccuracy}%</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card">
              <CardContent className="p-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Time</p>
                  <p className="text-3xl font-bold text-foreground">{formatTime(stats.totalTime)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Records List */}
          {records.length === 0 ? (
            <Card className="border-border/50 bg-card">
              <CardContent className="p-12 text-center">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Practice Records</h3>
                <p className="text-muted-foreground mb-6">Start practicing to see your records here</p>
                <Link href="/practice/generate">
                  <Button>Start Practicing</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Practice History</h2>
              {records.map((record) => (
                <Card key={record.id} className="border-border/50 bg-card hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">{record.topic}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant="secondary"
                            className={
                              record.difficulty === "Easy"
                                ? "bg-secondary/20 text-secondary"
                                : record.difficulty === "Medium"
                                  ? "bg-primary/20 text-primary"
                                  : "bg-accent/20 text-accent"
                            }
                          >
                            {record.difficulty}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{formatDate(record.date)}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="text-2xl font-bold text-foreground">{record.accuracy}%</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {record.correctAnswers}/{record.totalQuestions} correct
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(record.timeSpent)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>{record.correctAnswers} correct</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <XCircle className="h-4 w-4 text-destructive" />
                        <span>{record.totalQuestions - record.correctAnswers} incorrect</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}


