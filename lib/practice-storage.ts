import { WeakKnowledgePoint, PracticeRecord, PracticeSession } from "@/types/practice"

const STORAGE_KEYS = {
  WEAK_POINTS: "weakKnowledgePoints",
  PRACTICE_RECORDS: "practiceRecords",
  CURRENT_SESSION: "currentPracticeSession",
}

export const practiceStorage = {
  // Weak Knowledge Points
  getWeakPoints: (): WeakKnowledgePoint[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEYS.WEAK_POINTS)
    if (!data) return getDefaultWeakPoints()
    try {
      return JSON.parse(data)
    } catch {
      return getDefaultWeakPoints()
    }
  },

  saveWeakPoints: (points: WeakKnowledgePoint[]): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.WEAK_POINTS, JSON.stringify(points))
  },

  updateWeakPoint: (pointId: string, updates: Partial<WeakKnowledgePoint>): void => {
    const points = practiceStorage.getWeakPoints()
    const index = points.findIndex((p) => p.id === pointId)
    if (index !== -1) {
      points[index] = { ...points[index], ...updates }
      practiceStorage.saveWeakPoints(points)
    }
  },

  // Practice Records
  getPracticeRecords: (): PracticeRecord[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEYS.PRACTICE_RECORDS)
    if (!data) return []
    try {
      return JSON.parse(data)
    } catch {
      return []
    }
  },

  savePracticeRecord: (record: PracticeRecord): void => {
    if (typeof window === "undefined") return
    const records = practiceStorage.getPracticeRecords()
    records.unshift(record)
    localStorage.setItem(STORAGE_KEYS.PRACTICE_RECORDS, JSON.stringify(records))
  },

  // Current Practice Session
  getCurrentSession: (): PracticeSession | null => {
    if (typeof window === "undefined") return null
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION)
    if (!data) return null
    try {
      return JSON.parse(data)
    } catch {
      return null
    }
  },

  saveCurrentSession: (session: PracticeSession): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session))
  },

  clearCurrentSession: (): void => {
    if (typeof window === "undefined") return
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION)
  },
}

function getDefaultWeakPoints(): WeakKnowledgePoint[] {
  return [
    {
      id: "1",
      name: "Algebraic Equations",
      category: "Algebra",
      weaknessLevel: 92,
      questionsAnswered: 12,
      correctRate: 28,
    },
    {
      id: "2",
      name: "Integration Techniques",
      category: "Calculus",
      weaknessLevel: 88,
      questionsAnswered: 14,
      correctRate: 35,
    },
    {
      id: "3",
      name: "Calculus Derivatives",
      category: "Calculus",
      weaknessLevel: 79,
      questionsAnswered: 20,
      correctRate: 48,
    },
    {
      id: "4",
      name: "Linear Transformations",
      category: "Linear Algebra",
      weaknessLevel: 73,
      questionsAnswered: 10,
      correctRate: 52,
    },
    {
      id: "5",
      name: "Quadratic Functions",
      category: "Algebra",
      weaknessLevel: 64,
      questionsAnswered: 18,
      correctRate: 61,
    },
    {
      id: "6",
      name: "Trigonometric Identities",
      category: "Trigonometry",
      weaknessLevel: 55,
      questionsAnswered: 15,
      correctRate: 68,
    },
    {
      id: "7",
      name: "Probability Theory",
      category: "Statistics",
      weaknessLevel: 42,
      questionsAnswered: 22,
      correctRate: 78,
    },
    {
      id: "8",
      name: "Complex Numbers",
      category: "Algebra",
      weaknessLevel: 31,
      questionsAnswered: 16,
      correctRate: 85,
    },
  ]
}
