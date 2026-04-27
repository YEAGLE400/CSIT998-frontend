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

export type PracticeAgentSource = "weak-point" | "question-bank" | "custom-modal" | "knowledge-map"
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
  evidence: Array<{
    label: string
    value: string
    detail: string
  }>
  constraints: string[]
  alternativeApproach: string
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
  metrics: Array<{
    label: string
    value: string
    detail: string
  }>
  strengths: string[]
  concerns: string[]
  checks: PracticeAgentReviewCheck[]
  recommendedAction: string
}

export interface PracticeAgentGenerationReport {
  poolStats: Array<{
    label: string
    count: number
    detail: string
  }>
  selectionNotes: string[]
  rejectedCandidates: number
  diversityNotes: string[]
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
  generationReport?: PracticeAgentGenerationReport
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
    description: "Checking fluency, difficulty, novelty, quantity, and repetition",
  },
]

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5)
}

function sampleOne<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function sampleMany<T>(items: T[], count: number): T[] {
  return shuffle(items).slice(0, count)
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

  const planLens = sampleOne([
    "weakness-first sequencing",
    "difficulty calibration",
    "knowledge-transfer reinforcement",
    "confidence recovery",
    "freshness and repetition control",
  ])
  const pacingStyle = sampleOne([
    "start with one accessible anchor before raising complexity",
    "alternate direct recall with applied reasoning",
    "cluster similar prerequisites together, then switch contexts",
    "mix familiar formats with one or two less predictable prompts",
  ])
  const distractorPolicy = sampleOne([
    "keep distractors close enough to expose common misconceptions",
    "avoid distractors that only test arithmetic slips",
    "prefer options that separate concept errors from calculation errors",
  ])

  const strategy = [
    `Prioritize ${focusKnowledge} through ${planLens}.`,
    relatedKnowledge.length > 0
      ? `Blend in ${relatedKnowledge.join(" and ")} to reinforce prerequisite and follow-up transfer.`
      : "Stay tightly scoped to the selected focus knowledge point to keep the session targeted.",
    `Pacing rule: ${pacingStyle}.`,
    `Distractor rule: ${distractorPolicy}.`,
    "Use objective questions so the scoring flow stays reliable and immediate.",
  ]
  const evidence = [
    {
      label: "Weakness signal",
      value: `${config.sessionPoint.weaknessLevel}%`,
      detail: `${config.sessionPoint.name} is currently the primary remediation target.`,
    },
    {
      label: "Correct rate",
      value: `${config.sessionPoint.correctRate}%`,
      detail: sampleOne([
        "The session should leave room for confidence-building questions.",
        "The plan can tolerate moderate challenge without becoming too brittle.",
        "The learner needs clear feedback loops on each misconception.",
      ]),
    },
    {
      label: "Practice history",
      value: `${config.sessionPoint.questionsAnswered} answered`,
      detail: sampleOne([
        "Enough history exists to make a targeted session useful.",
        "Recent practice volume supports a compact personalized set.",
        "The planner should avoid overfitting to a single previous mistake.",
      ]),
    },
  ]
  const constraints = sampleMany([
    "Keep every item auto-gradable.",
    "Avoid repeating the same opening stem pattern.",
    "Preserve the requested question count exactly.",
    "Keep the selected difficulty as the main anchor.",
    "Prefer coverage breadth when two candidates are equivalent.",
    "Reserve fallback questions only for pool shortages.",
  ], 4)
  const alternativeApproach = sampleOne([
    "A broader mixed-topic session was considered but rejected to keep remediation focused.",
    "A harder challenge set was considered but rejected because the current weakness signal needs staged recovery.",
    "A purely prerequisite session was considered but rejected because the selected KC still needs direct practice.",
    "A random question-bank draw was considered but rejected because it would lose the KC rationale.",
  ])

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
    evidence,
    constraints,
    alternativeApproach,
    reasoning: `The learner shows a ${config.sessionPoint.weaknessLevel}% weakness signal on ${config.sessionPoint.name}. The planner uses ${planLens} and ${pacingStyle} so the session can stay focused while still feeling varied.`,
    summary: `Target ${config.quantity} ${config.difficulty} questions centered on ${focusKnowledge}${relatedKnowledge.length ? ` with support from ${relatedKnowledge.join(", ")}` : ""}.`,
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

export function buildMockGenerationReport(
  config: PracticeAgentConfig,
  plan: PracticeAgentPlan,
  questionsData: RawQuestionItem[],
  generatedQuestions: Question[]
): PracticeAgentGenerationReport {
  const objectiveQuestions = questionsData.filter((item) =>
    item.question.type === "single_choice" && extractOptionLines(item.question.content).length > 0
  )
  const focusPool = objectiveQuestions.filter((item) =>
    (item.question.knowledge || []).includes(plan.focusKnowledge)
  )
  const relatedPool = objectiveQuestions.filter((item) =>
    (item.question.knowledge || []).some((knowledge) => plan.relatedKnowledge.includes(knowledge))
  )
  const difficultyPool = objectiveQuestions.filter((item) => questionMatchesDifficulty(item, config.difficulty))
  const representedKnowledge = new Set(
    generatedQuestions.flatMap((question) =>
      question.knowledgePoint.split(",").map((item) => item.trim()).filter(Boolean)
    )
  )
  const uniquePromptStarts = new Set(
    generatedQuestions.map((question) => question.question.trim().toLowerCase().slice(0, 36))
  )

  return {
    poolStats: [
      {
        label: "Objective pool",
        count: objectiveQuestions.length,
        detail: "Auto-gradable questions available before personalization.",
      },
      {
        label: "Focus KC pool",
        count: focusPool.length,
        detail: `Candidates directly tagged with ${plan.focusKnowledge}.`,
      },
      {
        label: "Related KC pool",
        count: relatedPool.length,
        detail: "Candidates that reinforce adjacent knowledge points.",
      },
      {
        label: "Difficulty match",
        count: difficultyPool.length,
        detail: `Candidates matching the requested ${config.difficulty} difficulty.`,
      },
    ],
    selectionNotes: sampleMany([
      "Ranked exact KC matches before adjacent reinforcement items.",
      "Balanced direct concept checks with applied worded prompts.",
      "Kept answer options intact so review can evaluate fluency reliably.",
      "Used fallback candidates only after the target difficulty bucket was filled.",
      "Preferred questions with distinct opening stems to improve freshness.",
      "Preserved the requested quantity before applying the final review checks.",
    ], 4),
    rejectedCandidates: Math.max(0, focusPool.length + relatedPool.length + difficultyPool.length - generatedQuestions.length),
    diversityNotes: [
      `${representedKnowledge.size} knowledge signal${representedKnowledge.size === 1 ? "" : "s"} represented.`,
      `${uniquePromptStarts.size}/${generatedQuestions.length} unique prompt openings.`,
      sampleOne([
        "The final set mixes short computation prompts with conceptual wording.",
        "The final set keeps the same KC target while varying surface form.",
        "The final set avoids placing near-identical stems back to back.",
      ]),
    ],
  }
}

export function buildPlanTraceEvents(config: PracticeAgentConfig, plan: PracticeAgentPlan): string[] {
  return [
    `Read ${config.sessionPoint.name} profile: ${config.sessionPoint.weaknessLevel}% weakness, ${config.sessionPoint.correctRate}% correct rate.`,
    `Selected planning lens: ${plan.strategy[0]}`,
    `Checked constraints: ${plan.constraints.slice(0, 2).join("; ")}.`,
    `Alternative considered: ${plan.alternativeApproach}`,
  ]
}

export function buildGenerationTraceEvents(report: PracticeAgentGenerationReport): string[] {
  const topPools = report.poolStats
    .slice(0, 3)
    .map((pool) => `${pool.label} ${pool.count}`)
    .join(", ")

  return [
    `Scanned candidate pools: ${topPools}.`,
    `Selection rule: ${report.selectionNotes[0]}`,
    `Diversity pass: ${report.diversityNotes.slice(0, 2).join(" ")}`,
    `Rejected ${report.rejectedCandidates} lower-fit candidates before finalizing the set.`,
  ]
}

export function buildReviewTraceEvents(review: PracticeAgentReview): string[] {
  return [
    `Review metrics collected: ${review.metrics.map((metric) => `${metric.label} ${metric.value}`).join(", ")}.`,
    `Passed checks: ${review.strengths.length}/${review.checks.length}.`,
    review.concerns.length > 0
      ? `Review concerns: ${review.concerns.slice(0, 2).join(" ")}`
      : "Review concerns: none detected in the generated set.",
  ]
}

export function buildMockReviewResult(
  config: PracticeAgentConfig,
  plan: PracticeAgentPlan,
  questions: Question[]
): PracticeAgentReview {
  const coveredKnowledge = new Set<string>()
  const normalizedQuestionTitles = new Set<string>()
  const normalizedQuestionStarts = new Set<string>()
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
    normalizedQuestionStarts.add(normalizedTitle.slice(0, 36))
  })

  const fluentQuestions = questions.filter((question) => {
    const prompt = question.question.trim()
    const hasReadableLength = prompt.length >= 12 && prompt.length <= 260
    const hasOptionsWhenNeeded = question.type !== "multiple-choice" || Boolean(question.options?.length)
    return hasReadableLength && hasOptionsWhenNeeded
  }).length
  const fluencyOk = questions.length > 0 && fluentQuestions === questions.length

  const difficultyMixTotal = plan.difficultyMix.reduce((sum, bucket) => sum + bucket.count, 0)
  const difficultyOk = difficultyMixTotal === config.quantity && plan.targetDifficulty === config.difficulty

  const noveltyRatio = questions.length > 0 ? normalizedQuestionStarts.size / questions.length : 0
  const knowledgeVariety = coveredKnowledge.size
  const noveltyOk = noveltyRatio >= 0.8 && (questions.length <= 3 || knowledgeVariety >= 1)

  const quantityOk = questions.length === config.quantity
  const duplicateOk = duplicateCount === 0
  const metrics = [
    {
      label: "Fluency",
      value: `${fluentQuestions}/${questions.length}`,
      detail: "Readable prompts with complete options.",
    },
    {
      label: "Difficulty",
      value: config.difficulty,
      detail: `Planned buckets total ${difficultyMixTotal}.`,
    },
    {
      label: "Novelty",
      value: `${Math.round(noveltyRatio * 100)}%`,
      detail: `${normalizedQuestionStarts.size} unique prompt openings detected.`,
    },
    {
      label: "Quantity",
      value: `${questions.length}/${config.quantity}`,
      detail: "Final set size compared with the requested count.",
    },
    {
      label: "Repetition",
      value: `${duplicateCount} duplicates`,
      detail: "Exact duplicate prompt screening.",
    },
  ]

  const checks: PracticeAgentReviewCheck[] = [
    {
      label: "Question fluency",
      passed: fluencyOk,
      detail: fluencyOk
        ? "All prompts are readable, scoped, and have the expected answer options."
        : `${questions.length - fluentQuestions} prompt(s) need smoother wording or complete options.`,
    },
    {
      label: "Difficulty value",
      passed: difficultyOk,
      detail: difficultyOk
        ? `Difficulty target is ${config.difficulty}, and the planned mix totals ${difficultyMixTotal} questions.`
        : `Difficulty mix totals ${difficultyMixTotal}, expected ${config.quantity} for ${config.difficulty}.`,
    },
    {
      label: "Novelty",
      passed: noveltyOk,
      detail: noveltyOk
        ? "Question stems and knowledge signals are varied enough for a fresh session."
        : "Question stems are too similar or the generated set lacks enough variety.",
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
  ]

  const passedChecks = checks.filter((check) => check.passed).length
  const score = Math.round((passedChecks / checks.length) * 100)
  const passed = score >= 80

  return {
    score,
    passed,
    summary: passed
      ? "The generated set passes the fluency, difficulty, novelty, quantity, and repetition review."
      : "The generated set needs review because one or more quality checks did not pass.",
    metrics,
    strengths: checks.filter((check) => check.passed).map((check) => check.label),
    concerns: checks.filter((check) => !check.passed).map((check) => check.detail),
    checks,
    recommendedAction: passed
      ? "Launch practice with the reviewed set."
      : "Retry once or continue manually with the current set.",
  }
}
