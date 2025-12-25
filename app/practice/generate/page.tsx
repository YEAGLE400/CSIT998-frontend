"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Brain, Zap, CheckCircle2, XCircle, Clock, Award, TrendingDown, Sparkles, Loader2, Home, ExternalLink, BookOpen, Filter } from "lucide-react"
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
import questionsData from "@/data/data.json"

type ViewMode = "selection" | "practice" | "analysis"
type GeneratingStep = "analyzing" | "identifying" | "generating" | "done"

export default function GeneratePracticePage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>("selection")
  const [weakPoints, setWeakPoints] = useState<WeakKnowledgePoint[]>([])
  const [selectedPoint, setSelectedPoint] = useState<WeakKnowledgePoint | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingStep, setGeneratingStep] = useState<GeneratingStep>("analyzing")
  const [generatingProgress, setGeneratingProgress] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
          question: item.question.content,
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

  const handleKnowledgePointClick = (knowledgePoint: string) => {
    const pointQuestions = questionsByKnowledge.get(knowledgePoint) || []
    const shuffled = [...pointQuestions].sort(() => Math.random() - 0.5)

    // Convert to internal format
    const convertedQuestions: Question[] = shuffled.map((item: any, index: number) => ({
      id: `q${index + 1}`,
      question: item.question.content,
      type: item.question.type === 'single_choice' || item.question.type === 'multiple_choice' ? 'multiple-choice' : 'short-answer',
      options: item.question.type === 'single_choice' || item.question.type === 'multiple_choice'
        ? item.question.content.split('\n').filter((line: string) => /^[A-D]\./.test(line))
        : undefined,
      correctAnswer: typeof item.answer === 'string' ? item.answer : item.answer.join(', '),
      explanation: item.analysis || 'No explanation available.',
      knowledgePoint: knowledgePoint
    }))

    const virtualPoint: WeakKnowledgePoint = {
      id: 'topic',
      name: knowledgePoint,
      category: 'Topic Practice',
      weaknessLevel: 50,
      questionsAnswered: 0,
      correctRate: 50
    }

    setQuestions(convertedQuestions)
    setSelectedPoint(virtualPoint)
    setViewMode("practice")
    setStartTime(new Date())
    setQuestionStartTime(new Date())
  }

  const handleGenerateQuestions = (config: QuestionGenerationConfig) => {
    // Directly pull requested quantity from data.json - ignore knowledge points and difficulty (use static/dead data)
    const shuffled = [...questionsData].sort(() => Math.random() - 0.5)
    const selectedQuestions = shuffled.slice(0, config.quantity)

    // Convert to internal format
    const convertedQuestions: Question[] = selectedQuestions.map((item: any, index: number) => ({
      id: `q${index + 1}`,
      question: item.question.content,
      type: item.question.type === 'single_choice' || item.question.type === 'multiple_choice' ? 'multiple-choice' : 'short-answer',
      options: item.question.type === 'single_choice' || item.question.type === 'multiple_choice'
        ? item.question.content.split('\n').filter((line: string) => /^[A-D]\./.test(line))
        : undefined,
      correctAnswer: typeof item.answer === 'string' ? item.answer : item.answer.join(', '),
      explanation: item.analysis || 'No explanation available.',
      knowledgePoint: config.knowledgePoints.join(', ')
    }))

    const virtualPoint: WeakKnowledgePoint = {
      id: 'personalized',
      name: 'Personalized Practice',
      category: 'AI Generated',
      weaknessLevel: 70,
      questionsAnswered: 0,
      correctRate: 50
    }

    setQuestions(convertedQuestions)
    setSelectedPoint(virtualPoint)
    setViewMode("practice")
    setStartTime(new Date())
    setQuestionStartTime(new Date())
    setIsModalOpen(false)
  }

  const simulateGeneration = async (point: WeakKnowledgePoint) => {
    setIsGenerating(true)
    setSelectedPoint(point)
    setGeneratingProgress(0)

    // Step 1: Analyzing (2-3 seconds)
    setGeneratingStep("analyzing")
    await new Promise((resolve) => setTimeout(resolve, 2500))
    setGeneratingProgress(25)

    // Step 2: Identifying (2-3 seconds)
    setGeneratingStep("identifying")
    await new Promise((resolve) => setTimeout(resolve, 2800))
    setGeneratingProgress(50)

    // Step 3: Generating (3-4 seconds with progressive updates)
    setGeneratingStep("generating")
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setGeneratingProgress(65)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setGeneratingProgress(80)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setGeneratingProgress(95)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setGeneratingProgress(100)

    setGeneratingStep("done")
    await new Promise((resolve) => setTimeout(resolve, 600))

    const generatedQuestions = generateQuestions(point)
    setQuestions(generatedQuestions)
    setViewMode("practice")
    setStartTime(new Date())
    setQuestionStartTime(new Date())
    setUserAnswers([])
    setCurrentQuestionIndex(0)
    setCurrentAnswer("")
    setIsGenerating(false)
  }

  const handleSelectKnowledgePoint = (point: WeakKnowledgePoint) => {
    simulateGeneration(point)
  }

  const generateQuestions = (point: WeakKnowledgePoint): Question[] => {
    // Try to find questions from data.json that match the knowledge point
    const matchingQuestions = questionsData.filter((item: any) => {
      const knowledge = item.question?.knowledge || []
      return knowledge.some((k: string) =>
        k.toLowerCase().includes(point.name.toLowerCase()) ||
        point.name.toLowerCase().includes(k.toLowerCase())
      )
    })

    // Shuffle and select random number of questions (5-10)
    const randomCount = Math.floor(Math.random() * 6) + 5 // Random between 5-10
    const shuffled = [...matchingQuestions].sort(() => Math.random() - 0.5)
    const selectedQuestions = shuffled.slice(0, Math.min(randomCount, matchingQuestions.length))

    // If we don't have enough matching questions, pull from entire data.json
    if (selectedQuestions.length < randomCount) {
      const allShuffled = [...questionsData].sort(() => Math.random() - 0.5)
      const additionalNeeded = randomCount - selectedQuestions.length
      const additionalQuestions = allShuffled.slice(0, additionalNeeded)
      selectedQuestions.push(...additionalQuestions)
    }

    // Convert to internal format
    const convertedQuestions: Question[] = selectedQuestions.map((item: any, index: number) => ({
      id: `q${index + 1}`,
      question: item.question.content,
      type: item.question.type === 'single_choice' || item.question.type === 'multiple_choice' ? 'multiple-choice' : 'short-answer',
      options: item.question.type === 'single_choice' || item.question.type === 'multiple_choice'
        ? item.question.content.split('\n').filter((line: string) => /^[A-D]\./.test(line))
        : undefined,
      correctAnswer: typeof item.answer === 'string' ? item.answer : item.answer.join(', '),
      explanation: item.analysis || 'No explanation available.',
      knowledgePoint: point.name
    }))

    return convertedQuestions
  }

  const handleSubmitAnswer = () => {
    if (!currentAnswer || !questionStartTime) return

    const currentQuestion = questions[currentQuestionIndex]
    const timeSpent = Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000)
    const isCorrect = currentAnswer === currentQuestion.correctAnswer

    const userAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      answer: currentAnswer,
      isCorrect,
      timeSpent,
    }

    const newAnswers = [...userAnswers, userAnswer]
    setUserAnswers(newAnswers)

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setCurrentAnswer("")
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
        userAnswer: answers[index].answer,
        correctAnswer: q.correctAnswer,
        isCorrect: answers[index].isCorrect,
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
          {/* Generating Overlay */}
          {isGenerating && (
            <div className="space-y-6">
              <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardContent className="p-12">
                  <div className="space-y-8 text-center">
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                          <Loader2 className="h-12 w-12 text-primary animate-spin" />
                        </div>
                        <div className="absolute -top-2 -right-2">
                          <Sparkles className="h-8 w-8 text-secondary animate-pulse" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h2 className="text-2xl font-bold text-foreground">
                        {generatingStep === "analyzing" && "Analyzing Your Performance"}
                        {generatingStep === "identifying" && "Identifying Weak Areas"}
                        {generatingStep === "generating" && "Generating Practice Questions"}
                        {generatingStep === "done" && "Almost Ready!"}
                      </h2>
                      <p className="text-muted-foreground">
                        {generatingStep === "analyzing" && "Reviewing your past practice records and performance metrics..."}
                        {generatingStep === "identifying" && `Focusing on ${selectedPoint?.name} concepts that need improvement...`}
                        {generatingStep === "generating" && "Creating personalized questions tailored to your level..."}
                        {generatingStep === "done" && "Preparing your practice session..."}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Progress value={generatingProgress} className="h-3" />
                      <p className="text-sm text-muted-foreground">{generatingProgress}% Complete</p>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Brain className="h-4 w-4" />
                      <span>AI-powered question generation in progress</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Selection Mode with Tabs */}
          {viewMode === "selection" && !isGenerating && (
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
                      {weakestPoints.map((point) => (
                        <Card
                          key={point.id}
                          className="border-border/50 bg-card/50 hover:bg-accent/5 cursor-pointer transition-all hover:shadow-md"
                          onClick={() => handleSelectKnowledgePoint(point as WeakKnowledgePoint)}
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
                          setCurrentAnswer(userAnswers[currentQuestionIndex - 1]?.answer || "")
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
                                {userAnswer.isCorrect ? (
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
                                    {userAnswer.timeSpent}s
                                  </Badge>
                                </div>
                                <p className="text-sm text-foreground">{question.question}</p>

                                <Separator />

                                <div className="space-y-2 text-sm">
                                  <div className="flex items-start gap-2">
                                    <span className="text-muted-foreground font-medium">Your answer:</span>
                                    <span className={userAnswer.isCorrect ? "text-primary font-medium" : "text-destructive font-medium"}>
                                      {userAnswer.answer}
                                    </span>
                                  </div>
                                  {!userAnswer.isCorrect && (
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
