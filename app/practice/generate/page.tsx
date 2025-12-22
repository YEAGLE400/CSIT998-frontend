"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Brain, Zap, CheckCircle2, XCircle, Clock, Award, TrendingDown, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { practiceStorage } from "@/lib/practice-storage"
import { WeakKnowledgePoint, Question, UserAnswer, PracticeRecord } from "@/types/practice"

type ViewMode = "selection" | "practice" | "analysis"
type GeneratingStep = "analyzing" | "identifying" | "generating" | "done"

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
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingStep, setGeneratingStep] = useState<GeneratingStep>("analyzing")
  const [generatingProgress, setGeneratingProgress] = useState(0)

  useEffect(() => {
    const points = practiceStorage.getWeakPoints()
    setWeakPoints(points.sort((a, b) => b.weaknessLevel - a.weaknessLevel))
  }, [])

  const simulateGeneration = async (point: WeakKnowledgePoint) => {
    setIsGenerating(true)
    setSelectedPoint(point)
    setGeneratingProgress(0)

    // Step 1: Analyzing student performance
    setGeneratingStep("analyzing")
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setGeneratingProgress(33)

    // Step 2: Identifying weak areas
    setGeneratingStep("identifying")
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setGeneratingProgress(66)

    // Step 3: Generating questions
    setGeneratingStep("generating")
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setGeneratingProgress(100)

    // Step 4: Done
    setGeneratingStep("done")
    await new Promise((resolve) => setTimeout(resolve, 500))

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
    const questionBank: Record<string, Question[]> = {
      "1": [
        {
          id: "q1",
          question: "Solve for x: 2x + 5 = 13",
          type: "multiple-choice",
          options: ["x = 3", "x = 4", "x = 5", "x = 6"],
          correctAnswer: "x = 4",
          explanation: "Subtract 5 from both sides: 2x = 8, then divide by 2: x = 4",
          knowledgePoint: point.name,
        },
        {
          id: "q2",
          question: "If 3(x - 2) = 15, what is the value of x?",
          type: "multiple-choice",
          options: ["x = 5", "x = 7", "x = 9", "x = 11"],
          correctAnswer: "x = 7",
          explanation: "First expand: 3x - 6 = 15, add 6: 3x = 21, divide by 3: x = 7",
          knowledgePoint: point.name,
        },
        {
          id: "q3",
          question: "Solve: (x + 4)/2 = 6",
          type: "multiple-choice",
          options: ["x = 6", "x = 8", "x = 10", "x = 12"],
          correctAnswer: "x = 8",
          explanation: "Multiply both sides by 2: x + 4 = 12, subtract 4: x = 8",
          knowledgePoint: point.name,
        },
        {
          id: "q4",
          question: "What is the solution to 5x - 3 = 2x + 9?",
          type: "multiple-choice",
          options: ["x = 2", "x = 3", "x = 4", "x = 5"],
          correctAnswer: "x = 4",
          explanation: "Subtract 2x from both sides: 3x - 3 = 9, add 3: 3x = 12, divide by 3: x = 4",
          knowledgePoint: point.name,
        },
        {
          id: "q5",
          question: "If 2(x + 3) - 4 = 10, find x",
          type: "multiple-choice",
          options: ["x = 3", "x = 4", "x = 5", "x = 6"],
          correctAnswer: "x = 4",
          explanation: "Expand: 2x + 6 - 4 = 10, simplify: 2x + 2 = 10, subtract 2: 2x = 8, divide by 2: x = 4",
          knowledgePoint: point.name,
        },
      ],
      "2": [
        {
          id: "q1",
          question: "What is the vertex form of y = x² + 6x + 8?",
          type: "multiple-choice",
          options: [
            "y = (x + 3)² - 1",
            "y = (x + 3)² + 1",
            "y = (x - 3)² - 1",
            "y = (x - 3)² + 1",
          ],
          correctAnswer: "y = (x + 3)² - 1",
          explanation: "Complete the square: y = (x² + 6x + 9) - 9 + 8 = (x + 3)² - 1",
          knowledgePoint: point.name,
        },
        {
          id: "q2",
          question: "Find the roots of x² - 5x + 6 = 0",
          type: "multiple-choice",
          options: ["x = 1, 6", "x = 2, 3", "x = -2, -3", "x = -1, -6"],
          correctAnswer: "x = 2, 3",
          explanation: "Factor: (x - 2)(x - 3) = 0, so x = 2 or x = 3",
          knowledgePoint: point.name,
        },
        {
          id: "q3",
          question: "What is the axis of symmetry for y = 2x² - 8x + 5?",
          type: "multiple-choice",
          options: ["x = 1", "x = 2", "x = 3", "x = 4"],
          correctAnswer: "x = 2",
          explanation: "The axis of symmetry is x = -b/(2a) = -(-8)/(2×2) = 8/4 = 2",
          knowledgePoint: point.name,
        },
        {
          id: "q4",
          question: "Which quadratic has a minimum value of -4 at x = 1?",
          type: "multiple-choice",
          options: [
            "y = (x - 1)² - 4",
            "y = (x + 1)² - 4",
            "y = -(x - 1)² - 4",
            "y = -(x + 1)² + 4",
          ],
          correctAnswer: "y = (x - 1)² - 4",
          explanation: "Vertex form y = a(x - h)² + k with vertex (1, -4) and a > 0 for minimum",
          knowledgePoint: point.name,
        },
        {
          id: "q5",
          question: "Solve x² + 4x - 5 = 0 using the quadratic formula",
          type: "multiple-choice",
          options: ["x = 1, -5", "x = -1, 5", "x = 1, 5", "x = -1, -5"],
          correctAnswer: "x = 1, -5",
          explanation: "x = (-4 ± √(16+20))/2 = (-4 ± 6)/2, giving x = 1 or x = -5",
          knowledgePoint: point.name,
        },
      ],
    }

    const defaultQuestions: Question[] = [
      {
        id: "q1",
        question: `What is a fundamental concept in ${point.name}?`,
        type: "multiple-choice",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: "Option A",
        explanation: "This is a sample question. In a real application, questions would be generated based on the specific knowledge point.",
        knowledgePoint: point.name,
      },
      {
        id: "q2",
        question: `Apply ${point.name} to solve this problem`,
        type: "multiple-choice",
        options: ["Answer 1", "Answer 2", "Answer 3", "Answer 4"],
        correctAnswer: "Answer 2",
        explanation: "This demonstrates the application of the concept with step-by-step reasoning.",
        knowledgePoint: point.name,
      },
      {
        id: "q3",
        question: `Which statement about ${point.name} is correct?`,
        type: "multiple-choice",
        options: ["Statement A", "Statement B", "Statement C", "Statement D"],
        correctAnswer: "Statement C",
        explanation: "Understanding this principle is key to mastering the topic.",
        knowledgePoint: point.name,
      },
      {
        id: "q4",
        question: `Advanced problem involving ${point.name}`,
        type: "multiple-choice",
        options: ["Solution 1", "Solution 2", "Solution 3", "Solution 4"],
        correctAnswer: "Solution 2",
        explanation: "This problem requires deeper understanding and multi-step reasoning.",
        knowledgePoint: point.name,
      },
      {
        id: "q5",
        question: `Critical thinking: ${point.name} application`,
        type: "multiple-choice",
        options: ["Result A", "Result B", "Result C", "Result D"],
        correctAnswer: "Result D",
        explanation: "This tests your ability to apply the concept in novel situations.",
        knowledgePoint: point.name,
      },
    ]

    return questionBank[point.id] || defaultQuestions
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

    const newCorrectRate = ((selectedPoint.correctRate * selectedPoint.questionsAnswered + correctCount) /
      (selectedPoint.questionsAnswered + questions.length))
    const newWeaknessLevel = Math.max(0, 100 - newCorrectRate)

    practiceStorage.updateWeakPoint(selectedPoint.id, {
      questionsAnswered: selectedPoint.questionsAnswered + questions.length,
      correctRate: Math.round(newCorrectRate),
      weaknessLevel: Math.round(newWeaknessLevel),
    })
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
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

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
              <Brain className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">
                {viewMode === "selection" && "Select Weak Knowledge Point"}
                {viewMode === "practice" && "Practice Session"}
                {viewMode === "analysis" && "Session Analysis"}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
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

              {selectedPoint && (
                <Card className="border-border/50 bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Selected Topic</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-foreground">{selectedPoint.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {selectedPoint.category}
                        </Badge>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-3">
                          <Zap className={`h-4 w-4 ${
                            selectedPoint.weaknessLevel > 75 ? "text-destructive" :
                            selectedPoint.weaknessLevel > 60 ? "text-orange-500" :
                            "text-yellow-500"
                          }`} />
                          <span className="text-sm font-medium">
                            {selectedPoint.weaknessLevel}% weak
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {selectedPoint.correctRate}% correct rate
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Selection Mode */}
          {viewMode === "selection" && !isGenerating && (
            <div className="space-y-6">
              <Card className="border-border/50 bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-destructive" />
                    Your Weak Knowledge Points
                  </CardTitle>
                  <CardDescription>
                    Select a topic you want to improve. Topics are sorted by weakness level.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {weakPoints.map((point) => (
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
            </div>
          )}

          {/* Practice Mode */}
          {viewMode === "practice" && currentQuestion && (
            <div className="space-y-6">
              {/* Progress Bar */}
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

              {/* Question Card */}
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
                      <Textarea
                        id="answer"
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        className="min-h-[120px]"
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
              {/* Summary Card */}
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

              {/* Detailed Results */}
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

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button variant="outline" onClick={handleRetry} className="flex-1">
                  Practice Another Topic
                </Button>
                <Link href="/practice/records" className="flex-1">
                  <Button className="w-full">View All Records</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
