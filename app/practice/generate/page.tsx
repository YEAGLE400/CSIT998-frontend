"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { ArrowLeft, Brain, Zap, CheckCircle2, XCircle, Clock, Award, TrendingDown, Sparkles, Home, ExternalLink, BookOpen, Filter, ShieldCheck, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { practiceStorage } from "@/lib/practice-storage"
import { WeakKnowledgePoint, Question, UserAnswer, PracticeRecord } from "@/types/practice"
import { extractKnowledgePoints, generateKnowledgeGraph, getWeakestKnowledgePoints } from "@/lib/knowledge-graph"
import { QuestionGenerationModal, QuestionGenerationConfig } from "@/components/question-generation-modal"
import { RichTextEditor } from "@/components/rich-text-editor"
import { QuestionTimer } from "@/components/question-timer"
import { PracticeAgentRunPanel } from "@/components/practice-agent-run-panel"
import {
  buildMockGeneratedQuestions,
  buildMockPlanFromKC,
  buildMockReviewResult,
  createInitialPracticeAgentRun,
  updatePracticeAgentRunStage,
  type PracticeAgentConfig,
  type PracticeAgentRun,
  type PracticeAgentSource,
} from "@/lib/practice-agent-mock"
import questionsData from "@/data/data.json"

type ViewMode = "selection" | "agent-run" | "practice" | "analysis"

export default function GeneratePracticePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("selection")
  const [weakPoints, setWeakPoints] = useState<WeakKnowledgePoint[]>([])
  const [selectedPoint, setSelectedPoint] = useState<WeakKnowledgePoint | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [agentRun, setAgentRun] = useState<PracticeAgentRun | null>(null)

  // Knowledge graph for personalized practice (static/memoized - won't regenerate on re-renders)
  const knowledgeGraph = useMemo(() => generateKnowledgeGraph(questionsData), [])
  const weakestPoints = useMemo(() => getWeakestKnowledgePoints(knowledgeGraph, 10), [knowledgeGraph])

  // Question bank data
  const knowledgePoints = extractKnowledgePoints(questionsData)
  const questionsByKnowledge = new Map<string, any[]>()

  questionsData.forEach(item => {
    if (item.question?.knowledge) {
      item.question.knowledge.forEach((k: string) => {
        if (!questionsByKnowledge.has(k)) {
          questionsByKnowledge.set(k, [])
        }
        questionsByKnowledge.get(k)?.push(item)
      })
    }
  })

  // Group knowledge points by category
  const knowledgeRelationships: Record<string, string> = {
    "absolute value": "Basic Math",
    "basic division": "Basic Math",
    "even and odd numbers": "Basic Math",
    "multiples": "Basic Math",
    "factors": "Basic Math",
    "square roots": "Basic Math",
    "exponents": "Basic Math",
    "powers": "Basic Math",
    "fractions to decimals": "Basic Math",
    "equivalent fractions": "Basic Math",
    "factorial": "Basic Math",
    "linear equations": "Algebra",
    "linear inequalities": "Algebra",
    "linear functions": "Algebra",
    "slope of a line": "Algebra",
    "systems of linear equations": "Algebra",
    "quadratic function": "Algebra",
    "quadratic equations": "Algebra",
    "quadratic inequalities": "Algebra",
    "extrema": "Algebra",
    "arithmetic sequence": "Sequences",
    "arithmetic sequences": "Sequences",
    "nth term": "Sequences",
    "geometric sequence": "Sequences",
    "sequence summation": "Sequences",
    "number sequences": "Sequences",
    "function evaluation": "Functions",
    "monotonicity of functions": "Functions",
    "derivatives of polynomials": "Calculus",
    "basic integration": "Calculus",
    "trigonometric identities": "Trigonometry",
    "types of angles": "Geometry",
    "properties of triangles": "Geometry",
    "area of a circle": "Geometry",
    "perimeter of polygons": "Geometry",
    "logarithms": "Logarithms",
    "exponential form": "Logarithms",
    "classical probability": "Statistics",
    "mean of data": "Statistics",
    "median": "Statistics",
    "prime numbers": "Number Theory",
    "irrational numbers": "Number Theory",
  }

  const categorizedKnowledge = new Map<string, string[]>()
  knowledgePoints.forEach(kp => {
    const category = knowledgeRelationships[kp] || "Other"
    if (!categorizedKnowledge.has(category)) {
      categorizedKnowledge.set(category, [])
    }
    categorizedKnowledge.get(category)?.push(kp)
  })

  const categories = Array.from(categorizedKnowledge.keys()).sort()

  useEffect(() => {
    // Check if we have generated questions from elsewhere
    const storedQuestions = localStorage.getItem('generatedQuestions')
    const storedConfig = localStorage.getItem('questionConfig')

    if (storedQuestions && storedConfig) {
      try {
        const parsedQuestions = JSON.parse(storedQuestions)
        const parsedConfig = JSON.parse(storedConfig)

        // Convert questions to internal format
        const convertedQuestions: Question[] = parsedQuestions.map((item: any, index: number) => ({
          id: `q${index + 1}`,
          question: item.question.content.split('\nA.')[0].trim(),
          type: item.question.type === 'single_choice' || item.question.type === 'multiple_choice' ? 'multiple-choice' : 'short-answer',
          options: item.question.type === 'single_choice' || item.question.type === 'multiple_choice'
            ? item.question.content.split('\n').filter((line: string) => /^[A-D]\./.test(line))
            : undefined,
          correctAnswer: typeof item.answer === 'string' ? item.answer : item.answer.join(', '),
          explanation: item.analysis || 'No explanation available.',
          knowledgePoint: parsedConfig.knowledgePoints.join(', ')
        }))

        const virtualPoint: WeakKnowledgePoint = {
          id: 'custom',
          name: parsedConfig.knowledgePoints.join(', '),
          category: 'Custom Practice',
          weaknessLevel: 70,
          questionsAnswered: 0,
          correctRate: 50
        }

        setQuestions(convertedQuestions)
        setSelectedPoint(virtualPoint)
        setViewMode("practice")
        setStartTime(new Date())
        setQuestionStartTime(new Date())

        localStorage.removeItem('generatedQuestions')
        localStorage.removeItem('questionConfig')
      } catch (error) {
        console.error('Failed to parse generated questions:', error)
        const points = practiceStorage.getWeakPoints()
        setWeakPoints(points.sort((a, b) => b.weaknessLevel - a.weaknessLevel))
      }
    } else {
      const points = practiceStorage.getWeakPoints()
      setWeakPoints(points.sort((a, b) => b.weaknessLevel - a.weaknessLevel))
    }
  }, [])

  const personalizedPoints = weakPoints.length > 0 ? weakPoints : (weakestPoints as WeakKnowledgePoint[])

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
  const agentPacing = {
    enter: 900,
    planThinking: 1400,
    planPause: 1100,
    generateThinking: 1400,
    generatePause: 1000,
    reviewThinking: 1400,
    retryPause: 1500,
    launchPause: 1800,
  }

  const buildSessionPoint = (
    source: PracticeAgentSource,
    knowledgePointNames: string[],
    point?: WeakKnowledgePoint
  ): WeakKnowledgePoint => {
    if (point) {
      return point
    }

    const graphPoint = knowledgeGraph.nodes.find((node) => node.id === knowledgePointNames[0] || node.name === knowledgePointNames[0])

    return {
      id: source === "question-bank" ? "topic" : "personalized",
      name: source === "custom-modal" ? knowledgePointNames.join(", ") : knowledgePointNames[0],
      category: source === "question-bank" ? "Topic Practice" : "AI Generated",
      weaknessLevel: graphPoint?.weaknessLevel ?? 65,
      questionsAnswered: graphPoint?.questionsAnswered ?? 0,
      correctRate: graphPoint?.correctRate ?? 50,
    }
  }

  const launchPracticeSession = (run: PracticeAgentRun, nextQuestions?: Question[]) => {
    const sessionQuestions = nextQuestions ?? run.generatedQuestions
    setQuestions(sessionQuestions)
    setSelectedPoint(run.config.sessionPoint)
    setViewMode("practice")
    setStartTime(new Date())
    setQuestionStartTime(new Date())
    setUserAnswers([])
    setCurrentQuestionIndex(0)
    setCurrentAnswer("")
  }

  const hydrateAnswerForQuestion = (question: Question | undefined, savedAnswer?: string) => {
    if (!question || !savedAnswer) return ""

    if (question.type === "multiple-choice" && question.options) {
      return question.options.find((option) => option.startsWith(savedAnswer)) || savedAnswer
    }

    return savedAnswer
  }

  const finalizeAgentRun = (
    run: PracticeAgentRun,
    review = run.review,
    canUseCurrentSet = false
  ): PracticeAgentRun => ({
    ...run,
    currentStage: "done",
    progress: 100,
    status: "completed",
    canUseCurrentSet,
    review,
    stages: run.stages.map((stage) => ({ ...stage, status: "completed" })),
  })

  const runGenerateAndReview = async (
    run: PracticeAgentRun,
    plan = run.plan,
    retryCount = run.retryCount
  ) => {
    if (!plan) return

    const generatingRun = updatePracticeAgentRunStage(
      {
        ...run,
        retryCount,
      },
      "generate",
      retryCount > 0 ? 62 : 45,
      retryCount > 0
        ? "Retrying generation with a broader fallback pool."
        : "Plan completed. Generate agent is assembling a question set."
    )
    setAgentRun(generatingRun)
    await wait(agentPacing.generateThinking)

    const generatedQuestions = buildMockGeneratedQuestions(generatingRun.config, plan, questionsData)
    const generatedRun: PracticeAgentRun = {
      ...generatingRun,
      generatedQuestions,
      progress: retryCount > 0 ? 72 : 65,
      timeline: [
        ...generatingRun.timeline,
        `Generate agent prepared ${generatedQuestions.length} objective questions for review.`,
      ],
    }
    setAgentRun(generatedRun)
    await wait(agentPacing.generatePause)

    const reviewingRun = updatePracticeAgentRunStage(
      generatedRun,
      "review",
      retryCount > 0 ? 82 : 78,
      "Review agent is checking coverage, duplicates, and MVP scoring safety."
    )
    setAgentRun(reviewingRun)
    await wait(agentPacing.reviewThinking)

    const review = buildMockReviewResult(reviewingRun.config, plan, generatedQuestions)
    const reviewedRun: PracticeAgentRun = {
      ...reviewingRun,
      review,
      generatedQuestions,
      progress: review.passed ? 96 : 88,
      timeline: [
        ...reviewingRun.timeline,
        `Review score ${review.score}. ${review.recommendedAction}`,
      ],
    }
    setAgentRun(reviewedRun)

    if (!review.passed && retryCount < 1) {
      await wait(agentPacing.retryPause)
      return runGenerateAndReview(
        {
          ...reviewedRun,
          retryCount: 1,
          timeline: [
            ...reviewedRun.timeline,
            "First review did not pass. One automatic retry is now running.",
          ],
        },
        plan,
        1
      )
    }

    const completedRun = finalizeAgentRun(
      {
        ...reviewedRun,
        retryCount,
        timeline: [
          ...reviewedRun.timeline,
          review.passed
            ? "Review passed. Launching practice session."
            : "Review still found risks. Waiting for your decision.",
        ],
      },
      review,
      !review.passed
    )
    setAgentRun(completedRun)

    if (review.passed) {
      await wait(agentPacing.launchPause)
      launchPracticeSession(completedRun, generatedQuestions)
    }
  }

  const startPracticeAgent = async (
    source: PracticeAgentSource,
    config: QuestionGenerationConfig,
    point?: WeakKnowledgePoint
  ) => {
    const sessionPoint = buildSessionPoint(source, config.knowledgePoints, point)
    const agentConfig: PracticeAgentConfig = {
      source,
      knowledgePoints: config.knowledgePoints,
      difficulty: config.difficulty,
      quantity: config.quantity,
      sessionPoint,
    }

    const initialRun = createInitialPracticeAgentRun(agentConfig)
    setAgentRun(initialRun)
    setSelectedPoint(sessionPoint)
    setViewMode("agent-run")
    setIsModalOpen(false)
    await wait(agentPacing.enter)

    const planningRun = updatePracticeAgentRunStage(
      initialRun,
      "plan",
      18,
      "Plan agent is reading the KC snapshot and session constraints."
    )
    setAgentRun(planningRun)
    await wait(agentPacing.planThinking)

    const plan = buildMockPlanFromKC(agentConfig, knowledgeGraph)
    const plannedRun: PracticeAgentRun = {
      ...planningRun,
      plan,
      progress: 34,
      timeline: [
        ...planningRun.timeline,
        `Plan ready. ${plan.summary}`,
      ],
    }
    setAgentRun(plannedRun)
    await wait(agentPacing.planPause)

    await runGenerateAndReview(plannedRun, plan, 0)
  }

  const handleKnowledgePointClick = (knowledgePoint: string) => {
    const pointQuestions = questionsByKnowledge.get(knowledgePoint) || []
    const quantity = Math.min(8, Math.max(5, pointQuestions.length || 5))

    void startPracticeAgent("question-bank", {
      knowledgePoints: [knowledgePoint],
      difficulty: "mixed",
      quantity,
    })
  }

  const handleGenerateQuestions = (config: QuestionGenerationConfig) => {
    void startPracticeAgent("custom-modal", config)
  }

  const handleSelectKnowledgePoint = (point: WeakKnowledgePoint) => {
    void startPracticeAgent(
      "weak-point",
      {
        knowledgePoints: [point.name],
        difficulty: point.weaknessLevel >= 75 ? "hard" : point.weaknessLevel >= 55 ? "medium" : "easy",
        quantity: 6,
      },
      point
    )
  }

  const handleSubmitAnswer = () => {
    if (!currentAnswer || !questionStartTime) return

    const currentQuestion = questions[currentQuestionIndex]
    const timeSpent = Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000)
    const normalizedUserAnswer = currentAnswer.match(/^([A-D])\./)?.[1] || currentAnswer.trim()
    const normalizedCorrectAnswer = currentQuestion.correctAnswer.trim()
    const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer

    const userAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      answer: normalizedUserAnswer,
      isCorrect,
      timeSpent,
    }

    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = userAnswer
    setUserAnswers(newAnswers)

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setCurrentAnswer(hydrateAnswerForQuestion(questions[currentQuestionIndex + 1], newAnswers[currentQuestionIndex + 1]?.answer))
      setQuestionStartTime(new Date())
    } else {
      saveResults(newAnswers)
      setViewMode("analysis")
    }
  }

  const saveResults = (answers: UserAnswer[]) => {
    if (!selectedPoint || !startTime) return

    const totalTime = Math.floor((new Date().getTime() - startTime.getTime()) / 60000)
    const correctCount = answers.filter((a) => a.isCorrect).length
    const accuracy = Math.round((correctCount / questions.length) * 100)

    const record: PracticeRecord = {
      id: Date.now().toString(),
      topic: selectedPoint.name,
      difficulty: selectedPoint.weaknessLevel > 75 ? "Hard" : selectedPoint.weaknessLevel > 60 ? "Medium" : "Easy",
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      accuracy,
      timeSpent: totalTime || 1,
      date: new Date().toISOString(),
      questions: questions.map((q, index) => ({
        id: q.id,
        question: q.question,
        userAnswer: answers[index]?.answer || "",
        correctAnswer: q.correctAnswer,
        isCorrect: answers[index]?.isCorrect || false,
        explanation: q.explanation,
      })),
    }

    practiceStorage.savePracticeRecord(record)

    if (selectedPoint.id !== 'custom' && selectedPoint.id !== 'topic' && selectedPoint.id !== 'personalized') {
      const newCorrectRate = ((selectedPoint.correctRate * selectedPoint.questionsAnswered + correctCount) /
        (selectedPoint.questionsAnswered + questions.length))
      const newWeaknessLevel = Math.max(0, 100 - newCorrectRate)

      practiceStorage.updateWeakPoint(selectedPoint.id, {
        questionsAnswered: selectedPoint.questionsAnswered + questions.length,
        correctRate: Math.round(newCorrectRate),
        weaknessLevel: Math.round(newWeaknessLevel),
      })
    }
  }

  const handleRetry = () => {
    setViewMode("selection")
    setSelectedPoint(null)
    setQuestions([])
    setUserAnswers([])
    setCurrentQuestionIndex(0)
    setCurrentAnswer("")
    setAgentRun(null)
    const points = practiceStorage.getWeakPoints()
    setWeakPoints(points.sort((a, b) => b.weaknessLevel - a.weaknessLevel))
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <div className="h-6 w-px bg-border" />
            <Link href="/practice">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Practice
              </Button>
            </Link>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">
                {viewMode === "selection" && "Practice"}
                {viewMode === "agent-run" && "Agent Run"}
                {viewMode === "practice" && "Practice Session"}
                {viewMode === "analysis" && "Session Analysis"}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {viewMode === "agent-run" && agentRun && (
            <PracticeAgentRunPanel
              run={agentRun}
              onUseCurrentSet={() => launchPracticeSession(agentRun)}
              onRetry={() => {
                if (!agentRun.plan || agentRun.retryCount >= 1) return

                void runGenerateAndReview(
                  {
                    ...agentRun,
                    status: "running",
                    canUseCurrentSet: false,
                    review: undefined,
                    timeline: [...agentRun.timeline, "Manual retry requested from the agent panel."],
                  },
                  agentRun.plan,
                  agentRun.retryCount + 1
                )
              }}
              onBackToSelection={handleRetry}
            />
          )}

          {/* Selection Mode with Tabs */}
          {viewMode === "selection" && (
            <Tabs defaultValue="question-bank" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
                <TabsTrigger value="question-bank" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Question Bank
                </TabsTrigger>
                <TabsTrigger value="personalized" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Personalized
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Question Bank by Knowledge Point */}
              <TabsContent value="question-bank">
                <Card className="border-border/50 bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Question Bank by Topic
                    </CardTitle>
                    <CardDescription>
                      Browse all {questionsData.length} questions organized by knowledge points. Click any topic to practice.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[600px] pr-4">
                      <Accordion type="single" collapsible defaultValue={categories[0]} className="w-full">
                        {categories.map(category => (
                          <AccordionItem key={category} value={category} className="border-b border-border">
                            <AccordionTrigger className="hover:no-underline py-4">
                              <div className="flex items-center gap-2 w-full">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <h3 className="font-semibold text-sm text-foreground">{category}</h3>
                                <Badge variant="outline" className="text-xs ml-auto mr-2">
                                  {categorizedKnowledge.get(category)?.length || 0} topics
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-4">
                              <div className="grid gap-2 pl-6">
                                {(categorizedKnowledge.get(category) || []).map(kp => {
                                  const questionCount = questionsByKnowledge.get(kp)?.length || 0
                                  return (
                                    <Card
                                      key={kp}
                                      className="border-border/50 bg-card/50 hover:bg-accent/10 cursor-pointer transition-all group"
                                      onClick={() => handleKnowledgePointClick(kp)}
                                    >
                                      <CardContent className="p-3">
                                        <div className="flex items-center justify-between">
                                          <div className="flex-1">
                                            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                              {kp}
                                            </p>
                                          </div>
                                          <Badge variant="secondary" className="text-xs">
                                            {questionCount} {questionCount === 1 ? 'question' : 'questions'}
                                          </Badge>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )
                                })}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 2: Personalized Practice (Weak Points) */}
              <TabsContent value="personalized">
                <div className="space-y-6">
                  <Card className="border-border/50 bg-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-destructive" />
                        Your Weak Knowledge Points
                      </CardTitle>
                      <CardDescription>
                        Practice topics you need to improve. Click any topic or use "Custom Generation" for more options.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {personalizedPoints.map((point) => (
                        <Card
                          key={point.id}
                          className="border-border/50 bg-card/50 hover:bg-accent/5 cursor-pointer transition-all hover:shadow-md"
                          onClick={() => handleSelectKnowledgePoint(point)}
                        >
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <h3 className="font-semibold text-foreground">{point.name}</h3>
                                  <Badge variant="secondary" className="text-xs">
                                    {point.category}
                                  </Badge>
                                </div>
                                <div className="text-right space-y-1">
                                  <div className="flex items-center gap-3">
                                    <Zap className={`h-4 w-4 ${
                                      point.weaknessLevel > 75 ? "text-destructive" :
                                      point.weaknessLevel > 60 ? "text-orange-500" :
                                      "text-yellow-500"
                                    }`} />
                                    <span className="text-sm font-medium">
                                      {point.weaknessLevel}% weak
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {point.correctRate}% correct rate
                                  </p>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>Progress</span>
                                  <span>{point.questionsAnswered} questions answered</span>
                                </div>
                                <Progress value={100 - point.weaknessLevel} className="h-2" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </CardContent>
                  </Card>

                  <Button
                    className="w-full gap-2"
                    size="lg"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <Sparkles className="h-5 w-5" />
                    Custom Question Generation
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {/* Practice Mode */}
          {viewMode === "practice" && currentQuestion && (
            <div className="space-y-6">
              {/* Progress Bar and Timer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-border/50 bg-card">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Question {currentQuestionIndex + 1} of {questions.length}
                        </span>
                        <span className="font-medium text-foreground">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <QuestionTimer startTime={questionStartTime} />
              </div>

              {agentRun?.plan && agentRun?.review && (
                <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-secondary/5">
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="h-4 w-4 text-primary" />
                          <p className="text-sm font-medium text-foreground">Agent session context</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{agentRun.plan.summary}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{agentRun.plan.focusKnowledge}</Badge>
                        <Badge variant="outline">{agentRun.plan.targetDifficulty}</Badge>
                        <Badge variant={agentRun.review.passed ? "default" : "destructive"} className="gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          Review {agentRun.review.score}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-border/50 bg-card">
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Badge variant="outline">{selectedPoint?.name}</Badge>
                  </div>
                  <CardTitle className="text-xl leading-relaxed">{currentQuestion.question}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {currentQuestion.type === "multiple-choice" && currentQuestion.options && (
                    <RadioGroup value={currentAnswer} onValueChange={setCurrentAnswer}>
                      <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-3 p-4 rounded-lg border border-border/50 hover:bg-accent/5 cursor-pointer transition-all"
                          >
                            <RadioGroupItem value={option} id={`option-${index}`} />
                            <Label
                              htmlFor={`option-${index}`}
                              className="flex-1 cursor-pointer text-base"
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  )}

                  {currentQuestion.type === "short-answer" && (
                    <div className="space-y-2">
                      <Label htmlFor="answer">Your Answer</Label>
                      <RichTextEditor
                        value={currentAnswer}
                        onChange={setCurrentAnswer}
                        placeholder="Type your answer here... You can use formatting tools above."
                      />
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4">
                    <Button
                      variant="outline"
                      disabled={currentQuestionIndex === 0}
                      onClick={() => {
                        if (currentQuestionIndex > 0) {
                          setCurrentQuestionIndex(currentQuestionIndex - 1)
                          setCurrentAnswer(
                            hydrateAnswerForQuestion(
                              questions[currentQuestionIndex - 1],
                              userAnswers[currentQuestionIndex - 1]?.answer
                            )
                          )
                        }
                      }}
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={!currentAnswer}
                      className="gap-2"
                    >
                      {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish"}
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Analysis Mode */}
          {viewMode === "analysis" && (
            <div className="space-y-6">
              <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-6 w-6 text-primary" />
                      Session Summary
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className={`text-lg px-4 py-1 ${
                        (userAnswers.filter((a) => a.isCorrect).length / questions.length) * 100 >= 80
                          ? "bg-primary/20 text-primary"
                          : (userAnswers.filter((a) => a.isCorrect).length / questions.length) * 100 >= 60
                            ? "bg-secondary/20 text-secondary"
                            : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {Math.round((userAnswers.filter((a) => a.isCorrect).length / questions.length) * 100)}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1 text-center">
                      <p className="text-sm text-muted-foreground">Total Questions</p>
                      <p className="text-3xl font-bold text-foreground">{questions.length}</p>
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-sm text-muted-foreground">Correct</p>
                      <p className="text-3xl font-bold text-primary">
                        {userAnswers.filter((a) => a.isCorrect).length}
                      </p>
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-sm text-muted-foreground">Incorrect</p>
                      <p className="text-3xl font-bold text-destructive">
                        {userAnswers.filter((a) => !a.isCorrect).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card">
                <CardHeader>
                  <CardTitle>Question Details & Explanations</CardTitle>
                  <CardDescription>Review your answers and learn from explanations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {questions.map((question, index) => {
                    const userAnswer = userAnswers[index]
                    return (
                      <div key={question.id}>
                        <Card className="border-border/50 bg-card/50">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-1">
                                {userAnswer?.isCorrect ? (
                                  <CheckCircle2 className="h-5 w-5 text-primary" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-destructive" />
                                )}
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between">
                                  <h4 className="font-medium text-foreground">
                                    Question {index + 1}
                                  </h4>
                                  <Badge variant="outline" className="gap-1">
                                    <Clock className="h-3 w-3" />
                                    {userAnswer?.timeSpent || 0}s
                                  </Badge>
                                </div>
                                <p className="text-sm text-foreground">{question.question}</p>

                                <Separator />

                                <div className="space-y-2 text-sm">
                                  <div className="flex items-start gap-2">
                                    <span className="text-muted-foreground font-medium">Your answer:</span>
                                    <span className={userAnswer?.isCorrect ? "text-primary font-medium" : "text-destructive font-medium"}>
                                      {userAnswer?.answer || "No answer"}
                                    </span>
                                  </div>
                                  {!userAnswer?.isCorrect && (
                                    <div className="flex items-start gap-2">
                                      <span className="text-muted-foreground font-medium">Correct answer:</span>
                                      <span className="text-primary font-medium">{question.correctAnswer}</span>
                                    </div>
                                  )}
                                  <div className="bg-accent/10 p-3 rounded-lg mt-2">
                                    <p className="text-muted-foreground font-medium mb-1">Explanation:</p>
                                    <p className="text-foreground">{question.explanation}</p>
                                  </div>

                                  <div className="pt-2">
                                    <Link
                                      href={`/solver?question=${encodeURIComponent(question.question)}&answer=${encodeURIComponent(question.correctAnswer)}&context=${encodeURIComponent(`Topic: ${selectedPoint?.name || 'Practice'}`)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Button variant="outline" size="sm" className="w-full gap-2">
                                        <Brain className="h-4 w-4" />
                                        Deep Analysis with AI Solver
                                        <ExternalLink className="h-3 w-3" />
                                      </Button>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        {index < questions.length - 1 && <Separator className="my-4" />}
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button variant="outline" onClick={handleRetry} className="flex-1">
                  Practice Again
                </Button>
                <Link href="/practice/records" className="flex-1">
                  <Button className="w-full">View All Records</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Question Generation Modal */}
      <QuestionGenerationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableKnowledgePoints={knowledgeGraph.nodes}
        onGenerate={handleGenerateQuestions}
      />
    </div>
  )
}
