export interface WeakKnowledgePoint {
  id: string
  name: string
  category: string
  weaknessLevel: number // 0-100, higher means weaker
  questionsAnswered: number
  correctRate: number
}

export interface Question {
  id: string
  question: string
  type: 'multiple-choice' | 'short-answer'
  options?: string[] // for multiple-choice
  correctAnswer: string
  explanation: string
  knowledgePoint: string
}

export interface UserAnswer {
  questionId: string
  answer: string
  isCorrect: boolean
  timeSpent: number // in seconds
}

export interface PracticeSession {
  id: string
  knowledgePointId: string
  knowledgePointName: string
  questions: Question[]
  userAnswers: UserAnswer[]
  startTime: string
  endTime?: string
  totalTimeSpent: number // in minutes
  accuracy: number
}

export interface PracticeRecord {
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
    explanation: string
  }>
}
