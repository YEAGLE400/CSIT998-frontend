"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Sparkles, CheckCircle2, XCircle, Clock, TrendingUp, Network, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KnowledgeStarMap } from "@/components/knowledge-star-map"
import { QuestionGenerationModal, QuestionGenerationConfig } from "@/components/question-generation-modal"
import { PracticeAnalytics } from "@/components/practice-analytics"
import { generateKnowledgeGraph, getRelatedKnowledgePoints, KnowledgeNode } from "@/lib/knowledge-graph"
import questionsData from "@/data/data.json"

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
    explanation?: string
  }>
}

export default function PracticeRecordsPage() {
  const router = useRouter()
  const [records, setRecords] = useState<PracticeRecord[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null)
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([])
  const [selectedRecord, setSelectedRecord] = useState<PracticeRecord | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list')

  // Generate knowledge graph (static/memoized - won't regenerate on re-renders)
  const knowledgeGraph = useMemo(() => generateKnowledgeGraph(questionsData), [])

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

  const handleNodeClick = (node: KnowledgeNode) => {
    setSelectedNode(node)

    // Highlight the selected node and its related nodes
    const related = getRelatedKnowledgePoints(knowledgeGraph, node.id)
    const nodesToHighlight = [
      node.id,
      ...related.prerequisites.map(n => n.id),
      ...related.followups.map(n => n.id)
    ]
    setHighlightedNodes(nodesToHighlight)

    // Open the modal
    setIsModalOpen(true)
  }

  const handleGenerateQuestions = (config: QuestionGenerationConfig) => {
    // Directly pull requested quantity from data.json - ignore knowledge points (use static/dead data)
    // Shuffle all questions first
    const shuffled = [...questionsData].sort(() => Math.random() - 0.5)

    // Take exactly the requested quantity (no filtering by knowledge points or difficulty)
    const selectedQuestions = shuffled.slice(0, config.quantity)

    // Store the selected questions and configuration
    localStorage.setItem('generatedQuestions', JSON.stringify(selectedQuestions))
    localStorage.setItem('questionConfig', JSON.stringify(config))

    // Navigate to practice page
    router.push('/practice/generate')
  }

  const handleRecordClick = (record: PracticeRecord) => {
    setSelectedRecord(record)
    setViewMode('detail')
  }

  const handleBackToList = () => {
    setSelectedRecord(null)
    setViewMode('list')
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
              <Network className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">Practice Records & Knowledge Map</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {viewMode === 'detail' && selectedRecord ? (
            // Detail View for Record Review
            <div className="space-y-6">
              <Button variant="ghost" onClick={handleBackToList} className="gap-2 mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back to Records
              </Button>

              <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-6 w-6 text-primary" />
                      {selectedRecord.topic}
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className={`text-lg px-4 py-1 ${
                        selectedRecord.accuracy >= 80
                          ? "bg-primary/20 text-primary"
                          : selectedRecord.accuracy >= 60
                            ? "bg-secondary/20 text-secondary"
                            : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {selectedRecord.accuracy}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{selectedRecord.difficulty}</Badge>
                    <span className="text-sm text-muted-foreground">{formatDate(selectedRecord.date)}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1 text-center">
                      <p className="text-sm text-muted-foreground">Total Questions</p>
                      <p className="text-3xl font-bold text-foreground">{selectedRecord.totalQuestions}</p>
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-sm text-muted-foreground">Correct</p>
                      <p className="text-3xl font-bold text-primary">{selectedRecord.correctAnswers}</p>
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-sm text-muted-foreground">Time Spent</p>
                      <p className="text-3xl font-bold text-foreground">{formatTime(selectedRecord.timeSpent)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card">
                <CardHeader>
                  <CardTitle>Question Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedRecord.questions.map((question, index) => (
                    <div key={question.id}>
                      <Card className="border-border/50 bg-card/50">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {question.isCorrect ? (
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                              ) : (
                                <XCircle className="h-5 w-5 text-destructive" />
                              )}
                            </div>
                            <div className="flex-1 space-y-2">
                              <h4 className="font-medium text-foreground">Question {index + 1}</h4>
                              <p className="text-sm text-foreground">{question.question}</p>

                              <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                  <span className="text-muted-foreground font-medium">Your answer:</span>
                                  <span className={question.isCorrect ? "text-primary font-medium" : "text-destructive font-medium"}>
                                    {question.userAnswer}
                                  </span>
                                </div>
                                {!question.isCorrect && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-muted-foreground font-medium">Correct answer:</span>
                                    <span className="text-primary font-medium">{question.correctAnswer}</span>
                                  </div>
                                )}
                                {question.explanation && (
                                  <div className="bg-accent/10 p-3 rounded-lg mt-2">
                                    <p className="text-muted-foreground font-medium mb-1">Explanation:</p>
                                    <p className="text-foreground">{question.explanation}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      {index < selectedRecord.questions.length - 1 && <div className="my-4" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : (
            // List View (existing tabs)
            <Tabs defaultValue="knowledge-map" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-3xl mx-auto">
              <TabsTrigger value="knowledge-map" className="gap-2">
                <Network className="h-4 w-4" />
                Knowledge Map
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="records" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Practice Records
              </TabsTrigger>
            </TabsList>

            {/* Knowledge Map Tab */}
            <TabsContent value="knowledge-map" className="space-y-6 mt-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-foreground">Knowledge Star Map</h2>
                <p className="text-muted-foreground">
                  Click on any knowledge point to generate personalized practice questions
                </p>
              </div>

              {/* Weak Points Summary */}
              <Card className="border-border/50 bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Your Weakest Knowledge Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {knowledgeGraph.nodes
                      .sort((a, b) => b.weaknessLevel - a.weaknessLevel)
                      .slice(0, 8)
                      .map((node) => (
                        <Badge
                          key={node.id}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary/10 transition-colors"
                          onClick={() => handleNodeClick(node)}
                        >
                          {node.name} ({node.weaknessLevel}%)
                        </Badge>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Knowledge Star Map */}
              <KnowledgeStarMap
                graphData={knowledgeGraph}
                onNodeClick={handleNodeClick}
                highlightedNodes={highlightedNodes}
              />

              <div className="text-center">
                <Button
                  size="lg"
                  className="gap-2"
                  onClick={() => {
                    setSelectedNode(null)
                    setHighlightedNodes([])
                    setIsModalOpen(true)
                  }}
                >
                  <Sparkles className="h-5 w-5" />
                  Generate Custom Practice
                </Button>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6 mt-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-foreground">Learning Analytics</h2>
                <p className="text-muted-foreground">
                  Track your progress and study patterns over time
                </p>
              </div>

              <PracticeAnalytics records={records} />
            </TabsContent>

            {/* Practice Records Tab */}
            <TabsContent value="records" className="space-y-6 mt-6">
              {/* Records List */}
              {records.length === 0 ? (
                <Card className="border-border/50 bg-card">
                  <CardContent className="p-12 text-center">
                    <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Practice Records</h3>
                    <p className="text-muted-foreground mb-6">Start practicing to see your records here</p>
                    <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                      <Sparkles className="h-4 w-4" />
                      Start Practicing
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">Practice History</h2>
                  {records.map((record) => (
                    <Card
                      key={record.id}
                      className="border-border/50 bg-card hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => handleRecordClick(record)}
                    >
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
            </TabsContent>
          </Tabs>
          )}
        </div>
      </main>

      {/* Question Generation Modal */}
      <QuestionGenerationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedNode(null)
          setHighlightedNodes([])
        }}
        availableKnowledgePoints={knowledgeGraph.nodes}
        selectedNodeId={selectedNode?.id}
        onGenerate={handleGenerateQuestions}
      />
    </div>
  )
}
