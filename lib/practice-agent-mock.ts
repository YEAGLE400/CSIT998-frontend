import { getRelatedKnowledgePoints, type KnowledgeGraphData } from "@/lib/knowledge-graph"
import type { Question, WeakKnowledgePoint } from "@/types/practice"

type RawQuestionItem = {
  question: {
    id: string
    type: string
    content: string
    knowledge?: string[]
    difficulty?: string
  }
  answer: string | string[]
  analysis?: string
}

export type PracticeAgentSource = "weak-point" | "question-bank" | "custom-modal"
export type PracticeAgentStage = "plan" | "generate" | "review" | "done"
export type PracticeAgentStageStatus = "pending" | "active" | "completed"
export type PracticeDifficulty = "easy" | "medium" | "hard" | "mixed"

export interface PracticeAgentConfig {
  source: PracticeAgentSource
  knowledgePoints: string[]
  difficulty: PracticeDifficulty
  quantity: number
  sessionPoint: WeakKnowledgePoint
}

export interface PracticeAgentDifficultyBucket {
  level: "easy" | "medium" | "hard"
  count: number
}

export interface PracticeAgentQuestionTypeBucket {
  type: "multiple-choice" | "short-answer"
  count: number
}

export interface PracticeAgentPlan {
  focusKnowledge: string
  relatedKnowledge: string[]
  weaknessSnapshot: {
    weaknessLevel: number
    correctRate: number
    questionsAnswered: number
  }
  targetDifficulty: PracticeDifficulty
  quantity: number
  difficultyMix: PracticeAgentDifficultyBucket[]
  questionTypeMix: PracticeAgentQuestionTypeBucket[]
  strategy: string[]
  reasoning: string
  summary: string
}

export interface PracticeAgentReviewCheck {
  label: string
  passed: boolean
  detail: string
}

export interface PracticeAgentReview {
  score: number
  passed: boolean
  summary: string
  strengths: string[]
  concerns: string[]
  checks: PracticeAgentReviewCheck[]
  recommendedAction: string
}

export interface PracticeAgentStageInfo {
  key: "plan" | "generate" | "review"
  title: string
  description: string
  status: PracticeAgentStageStatus
}

export interface PracticeAgentRun {
  id: string
  source: PracticeAgentSource
  currentStage: PracticeAgentStage
  progress: number
  status: "running" | "completed"
  retryCount: number
  canUseCurrentSet: boolean
  config: PracticeAgentConfig
  stages: PracticeAgentStageInfo[]
  timeline: string[]
  plan?: PracticeAgentPlan
  generatedQuestions: Question[]
  review?: PracticeAgentReview
}

const STAGE_BLUEPRINT: Array<Pick<PracticeAgentStageInfo, "key" | "title" | "description">> = [
  {
    key: "plan",
    title: "Plan Agent",
    description: "Turning KC signals into a practice strategy",
  },
  {
    key: "generate",
    title: "Generate Agent",
    description: "Assembling personalized questions from the practice bank",
  },
  {
    key: "review",
    title: "Review Agent",
    description: "Checking coverage, consistency, and session readiness",
  },
]

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5)
}

function extractOptionLines(content: string) {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[A-D]\./.test(line))
}

function normalizeDifficulty(difficulty?: string): "easy" | "medium" | "hard" {
  if (difficulty === "easy" || difficulty === "medium" || difficulty === "hard") {
    return difficulty
  }
  return "medium"
}

function buildDifficultyMix(quantity: number, targetDifficulty: PracticeDifficulty): PracticeAgentDifficultyBucket[] {
  if (targetDifficulty === "easy") {
    return [
      { level: "easy", count: Math.max(1, Math.ceil(quantity * 0.6)) },
      { level: "medium", count: Math.max(0, Math.floor(quantity * 0.3)) },
      { level: "hard", count: Math.max(0, quantity - Math.max(1, Math.ceil(quantity * 0.6)) - Math.max(0, Math.floor(quantity * 0.3))) },
    ]
  }

  if (targetDifficulty === "hard") {
    return [
      { level: "easy", count: Math.max(0, Math.floor(quantity * 0.2)) },
      { level: "medium", count: Math.max(1, Math.floor(quantity * 0.3)) },
      { level: "hard", count: Math.max(1, quantity - Math.max(0, Math.floor(quantity * 0.2)) - Math.max(1, Math.floor(quantity * 0.3))) },
    ]
  }

  if (targetDifficulty === "mixed") {
    const easyCount = Math.max(1, Math.floor(quantity * 0.4))
    const mediumCount = Math.max(1, Math.floor(quantity * 0.4))
    return [
      { level: "easy", count: easyCount },
      { level: "medium", count: mediumCount },
      { level: "hard", count: Math.max(0, quantity - easyCount - mediumCount) },
    ]
  }

  const mediumCount = Math.max(1, Math.ceil(quantity * 0.5))
  return [
    { level: "easy", count: Math.max(1, Math.floor(quantity * 0.25)) },
    { level: "medium", count: mediumCount },
    { level: "hard", count: Math.max(0, quantity - Math.max(1, Math.floor(quantity * 0.25)) - mediumCount) },
  ]
}

function questionMatchesDifficulty(item: RawQuestionItem, targetDifficulty: PracticeDifficulty) {
  if (targetDifficulty === "mixed") return true
  return normalizeDifficulty(item.question.difficulty) === targetDifficulty
}

function uniqueByQuestionId(items: RawQuestionItem[]) {
  const seen = new Set<string>()
  return items.filter((item) => {
    if (seen.has(item.question.id)) return false
    seen.add(item.question.id)
    return true
  })
}

function toPracticeQuestion(item: RawQuestionItem, index: number): Question {
  const knowledge = item.question.knowledge ?? []
  return {
    id: item.question.id || `q${index + 1}`,
    question: item.question.content.split("\nA.")[0].trim(),
    type: "multiple-choice",
    options: extractOptionLines(item.question.content),
    correctAnswer: typeof item.answer === "string" ? item.answer : item.answer.join(", "),
    explanation: item.analysis || "No explanation available.",
    knowledgePoint: knowledge.join(", "),
  }
}

function pickQuestionsForDifficulty(
  questions: RawQuestionItem[],
  level: "easy" | "medium" | "hard",
  count: number
) {
  return shuffle(
    questions.filter((item) => normalizeDifficulty(item.question.difficulty) === level)
  ).slice(0, count)
}

export function createInitialPracticeAgentRun(config: PracticeAgentConfig): PracticeAgentRun {
  return {
    id: `agent-run-${Date.now()}`,
    source: config.source,
    currentStage: "plan",
    progress: 5,
    status: "running",
    retryCount: 0,
    canUseCurrentSet: false,
    config,
    stages: STAGE_BLUEPRINT.map((stage, index) => ({
      ...stage,
      status: index === 0 ? "active" : "pending",
    })),
    timeline: [
      `Agent run created for ${config.sessionPoint.name}.`,
      `Source: ${config.source.replace("-", " ")}.`,
    ],
    generatedQuestions: [],
  }
}

export function updatePracticeAgentRunStage(
  run: PracticeAgentRun,
  currentStage: "plan" | "generate" | "review",
  progress: number,
  timelineMessage: string
): PracticeAgentRun {
  return {
    ...run,
    currentStage,
    progress,
    timeline: [...run.timeline, timelineMessage],
    stages: run.stages.map((stage) => {
      if (stage.key === currentStage) {
        return { ...stage, status: "active" }
      }

      const stageOrder = STAGE_BLUEPRINT.findIndex((item) => item.key === stage.key)
      const activeOrder = STAGE_BLUEPRINT.findIndex((item) => item.key === currentStage)

      return {
        ...stage,
        status: stageOrder < activeOrder ? "completed" : "pending",
      }
    }),
  }
}

export function buildMockPlanFromKC(
  config: PracticeAgentConfig,
  knowledgeGraph: KnowledgeGraphData
): PracticeAgentPlan {
  const focusKnowledge = config.knowledgePoints[0] || config.sessionPoint.name
  const graphRelations = getRelatedKnowledgePoints(knowledgeGraph, focusKnowledge)
  const relatedKnowledge = Array.from(
    new Set([
      ...config.knowledgePoints.slice(1),
      ...graphRelations.prerequisites.map((item) => item.name),
      ...graphRelations.followups.map((item) => item.name),
    ])
  ).slice(0, 2)

  const difficultyMix = buildDifficultyMix(config.quantity, config.difficulty)
  const questionTypeMix: PracticeAgentQuestionTypeBucket[] = [
    { type: "multiple-choice", count: config.quantity },
    { type: "short-answer", count: 0 },
  ]

  const strategy = [
    `Prioritize ${focusKnowledge} because it is the strongest weak-signal topic in this run.`,
    relatedKnowledge.length > 0
      ? `Blend in ${relatedKnowledge.join(" and ")} to reinforce prerequisite and follow-up transfer.`
      : "Stay tightly scoped to the selected focus knowledge point to keep the session targeted.",
    "Use objective questions only in the MVP so scoring stays reliable without backend grading.",
  ]

  return {
    focusKnowledge,
    relatedKnowledge,
    weaknessSnapshot: {
      weaknessLevel: config.sessionPoint.weaknessLevel,
      correctRate: config.sessionPoint.correctRate,
      questionsAnswered: config.sessionPoint.questionsAnswered,
    },
    targetDifficulty: config.difficulty,
    quantity: config.quantity,
    difficultyMix,
    questionTypeMix,
    strategy,
    reasoning: `The learner shows a ${config.sessionPoint.weaknessLevel}% weakness signal on ${config.sessionPoint.name}, so the plan focuses on one core KC with a small amount of adjacent reinforcement.`,
    summary: `Target ${config.quantity} questions centered on ${focusKnowledge}${relatedKnowledge.length ? ` with support from ${relatedKnowledge.join(", ")}` : ""}.`,
  }
}

export function buildMockGeneratedQuestions(
  config: PracticeAgentConfig,
  plan: PracticeAgentPlan,
  questionsData: RawQuestionItem[]
): Question[] {
  const objectiveQuestions = questionsData.filter((item) => {
    const questionType = item.question.type
    return questionType === "single_choice" && extractOptionLines(item.question.content).length > 0
  })

  const focusPool = objectiveQuestions.filter((item) =>
    (item.question.knowledge || []).includes(plan.focusKnowledge)
  )

  const relatedPool = objectiveQuestions.filter((item) =>
    (item.question.knowledge || []).some((knowledge) => plan.relatedKnowledge.includes(knowledge))
  )

  const generalPool = objectiveQuestions.filter((item) =>
    (item.question.knowledge || []).some((knowledge) => config.knowledgePoints.includes(knowledge))
  )

  const preferredPool = uniqueByQuestionId([
    ...shuffle(focusPool.filter((item) => questionMatchesDifficulty(item, config.difficulty))),
    ...shuffle(relatedPool.filter((item) => questionMatchesDifficulty(item, config.difficulty))),
    ...shuffle(generalPool.filter((item) => questionMatchesDifficulty(item, config.difficulty))),
  ])

  const fallbackPool = uniqueByQuestionId([
    ...shuffle(focusPool),
    ...shuffle(relatedPool),
    ...shuffle(generalPool),
    ...shuffle(objectiveQuestions),
  ])

  const selectedRawQuestions: RawQuestionItem[] = []
  const desiredMix = plan.difficultyMix.filter((bucket) => bucket.count > 0)

  desiredMix.forEach((bucket) => {
    const bucketCandidates = uniqueByQuestionId([
      ...pickQuestionsForDifficulty(preferredPool, bucket.level, bucket.count + 2),
      ...pickQuestionsForDifficulty(fallbackPool, bucket.level, bucket.count + 4),
    ]).filter((item) =>
      !selectedRawQuestions.some((selected) => selected.question.id === item.question.id)
    )

    selectedRawQuestions.push(...bucketCandidates.slice(0, bucket.count))
  })

  if (selectedRawQuestions.length < config.quantity) {
    const fillers = fallbackPool.filter((item) =>
      !selectedRawQuestions.some((selected) => selected.question.id === item.question.id)
    )
    selectedRawQuestions.push(...fillers.slice(0, config.quantity - selectedRawQuestions.length))
  }

  return selectedRawQuestions
    .slice(0, config.quantity)
    .map((item, index) => toPracticeQuestion(item, index))
}

export function buildMockReviewResult(
  config: PracticeAgentConfig,
  plan: PracticeAgentPlan,
  questions: Question[]
): PracticeAgentReview {
  const coveredKnowledge = new Set<string>()
  const normalizedQuestionTitles = new Set<string>()
  let duplicateCount = 0

  questions.forEach((question) => {
    question.knowledgePoint
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((knowledge) => coveredKnowledge.add(knowledge))

    const normalizedTitle = question.question.trim().toLowerCase()
    if (normalizedQuestionTitles.has(normalizedTitle)) {
      duplicateCount += 1
    }
    normalizedQuestionTitles.add(normalizedTitle)
  })

  const focusCovered = coveredKnowledge.has(plan.focusKnowledge)
  const relatedCovered = plan.relatedKnowledge.length === 0
    ? true
    : plan.relatedKnowledge.some((knowledge) => coveredKnowledge.has(knowledge))
  const quantityOk = questions.length === config.quantity
  const duplicateOk = duplicateCount === 0
  const objectiveOnly = questions.every((question) => question.type === "multiple-choice")

  const checks: PracticeAgentReviewCheck[] = [
    {
      label: "Focus KC coverage",
      passed: focusCovered,
      detail: focusCovered
        ? `${plan.focusKnowledge} appears in the generated set.`
        : `${plan.focusKnowledge} is missing from the final set.`,
    },
    {
      label: "Related KC reinforcement",
      passed: relatedCovered,
      detail: relatedCovered
        ? "At least one adjacent knowledge point is represented."
        : "The set is too narrow and misses adjacent reinforcement.",
    },
    {
      label: "Question count",
      passed: quantityOk,
      detail: quantityOk
        ? `${questions.length} questions prepared as planned.`
        : `Expected ${config.quantity} questions but only prepared ${questions.length}.`,
    },
    {
      label: "Duplicate screening",
      passed: duplicateOk,
      detail: duplicateOk
        ? "No duplicate question prompts detected."
        : `${duplicateCount} duplicated prompts were detected.`,
    },
    {
      label: "MVP scoring safety",
      passed: objectiveOnly,
      detail: objectiveOnly
        ? "All questions are objective, so client-side scoring is reliable."
        : "Some subjective items require backend grading.",
    },
  ]

  const passedChecks = checks.filter((check) => check.passed).length
  const score = Math.round((passedChecks / checks.length) * 100)
  const passed = score >= 80

  return {
    score,
    passed,
    summary: passed
      ? "The generated set is coherent enough for the MVP practice session."
      : "The generated set needs operator review before launching practice.",
    strengths: checks.filter((check) => check.passed).map((check) => check.label),
    concerns: checks.filter((check) => !check.passed).map((check) => check.detail),
    checks,
    recommendedAction: passed
      ? "Launch practice with the reviewed set."
      : "Retry once or continue manually with the current set.",
  }
}
