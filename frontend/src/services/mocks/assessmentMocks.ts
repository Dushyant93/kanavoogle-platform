// Mock backend for the assessment screens. Used only in local dev while the real
// API isn't ready (see USE_ASSESSMENT_MOCKS). Responses have the same shape the
// real endpoints should return, so switching to the backend needs no page changes.
//
// Pages navigate with full page loads, so mock state lives in sessionStorage.
import type { Assessment, AssessmentQuestion, Complexity } from '../../types/assessment'
import type {
  AssessmentListItem,
  AssessmentReport,
  StartAssessmentRequest,
  SubmitAnswersRequest,
} from '../../types/assessmentFlow'
import type { Skill } from '../../types/skills'
import { ApiError } from '../http'

const STORE_KEY = 'kanavoogle:mock:assessments'
const REPORT_KEY = 'kanavoogle:mock:reports'
const DELAY_MS = 250

const COIN_REWARD: Record<Complexity, number> = { FOUNDATION: 1, INTERMEDIATE: 2, ADVANCED: 3 }

const SKILLS: Skill[] = [
  {
    id: 'skill-cr',
    code: 'CR',
    name: 'Creativity & Innovation - Design Thinking & Ideation',
    active: true,
    subSkills: [
      { id: 'cr-1', name: 'Design Thinking', active: true },
      { id: 'cr-2', name: 'Brainstorming Techniques', active: true },
      { id: 'cr-3', name: 'Pitching Ideas', active: true },
      { id: 'cr-4', name: 'UX/UI Wireframing', active: true },
      { id: 'cr-5', name: 'Storyboarding for Apps', active: true },
      { id: 'cr-6', name: 'Iteration & Prototyping', active: true },
    ],
  },
  {
    id: 'skill-ps',
    code: 'PS',
    name: 'Problem Solving - Analysis & Decision Making',
    active: true,
    subSkills: [
      { id: 'ps-1', name: 'Root Cause Analysis', active: true },
      { id: 'ps-2', name: 'Logical Reasoning', active: true },
      { id: 'ps-3', name: 'Decision Frameworks', active: true },
    ],
  },
  {
    id: 'skill-du',
    code: 'DU',
    name: 'Digital Use - Tools & Responsible Technology',
    active: true,
    subSkills: [
      { id: 'du-1', name: 'Data Handling', active: true },
      { id: 'du-2', name: 'Algorithmic Accountability', active: true },
      { id: 'du-3', name: 'Online Safety', active: true },
    ],
  },
]

// Correct answers stay here, never in what the questions endpoint returns.
const QUESTION_BANK: (AssessmentQuestion & { answer: number })[] = [
  {
    questionId: 'q1',
    type: 'MULTIPLE_CHOICE',
    prompt: 'A school club wants more members. What is the best first step before designing a new poster?',
    options: [
      'Copy last year’s poster',
      'Ask current students what would make them join',
      'Use the brightest colours possible',
      'Put the poster in every classroom',
    ],
    answer: 1,
  },
  {
    questionId: 'q2',
    type: 'MULTIPLE_CHOICE',
    prompt: 'During a brainstorm, which rule helps the group come up with the most ideas?',
    options: [
      'Judge each idea as soon as it is said',
      'Only the team leader shares ideas',
      'Hold back criticism until the idea list is finished',
      'Stop after the first good idea',
    ],
    answer: 2,
  },
  {
    questionId: 'q3',
    type: 'MULTIPLE_CHOICE',
    prompt: 'A local cafe wants to track which menu items sell out fastest. Which approach best identifies the pattern?',
    options: [
      'Ask the owner to guess based on memory',
      'Log daily sales and compare totals over 2 weeks',
      'Change the menu until sales improve',
      'Survey customers once about their favourite item',
    ],
    answer: 1,
  },
  {
    questionId: 'q4',
    type: 'MULTIPLE_CHOICE',
    prompt: 'What is the main purpose of a low-fidelity wireframe?',
    options: [
      'To show final colours and fonts',
      'To quickly test layout and flow before detailed design',
      'To replace user testing',
      'To write the app’s code',
    ],
    answer: 1,
  },
  {
    questionId: 'q5',
    type: 'MULTIPLE_CHOICE',
    prompt: 'You have 60 seconds to pitch an app idea. What should you lead with?',
    options: [
      'A full list of every feature',
      'The problem your app solves and who it helps',
      'How much it will cost to build',
      'The programming language you will use',
    ],
    answer: 1,
  },
  {
    questionId: 'q6',
    type: 'MULTIPLE_CHOICE',
    prompt: 'A storyboard for an app mainly helps the team to…',
    options: [
      'Pick a company name',
      'See the user’s journey screen by screen',
      'Set the app’s price',
      'Choose a database',
    ],
    answer: 1,
  },
  {
    questionId: 'q7',
    type: 'MULTIPLE_CHOICE',
    prompt: 'Testers say a prototype’s sign-up is confusing. What is the best next step?',
    options: [
      'Ignore it since most testers finished',
      'Simplify the sign-up and test it again',
      'Add more fields to collect extra data',
      'Launch anyway and fix it later',
    ],
    answer: 1,
  },
  {
    questionId: 'q8',
    type: 'MULTIPLE_CHOICE',
    prompt:
      'A startup team is preparing to launch a new feature with a 3-week timeline and tight budget. Which method best ensures rapid user validation while minimizing delivery risk?',
    options: [
      'Launch full product immediately and track complaints',
      'Test an interactive clickable prototype to validate core assumptions',
      'Delay launch until extensive multi-month market surveys finish',
      'Rely strictly on competitor benchmarks without testing',
    ],
    answer: 1,
  },
]

function seed(
  id: string,
  title: string,
  skillName: string,
  subSkillName: string,
  complexity: Complexity,
  questionCount: number,
  percent: number | null,
  createdAt: string,
  completedAt: string | null,
): AssessmentListItem {
  const done = percent != null
  return {
    id,
    title,
    skillId: 'seed',
    skillName,
    subSkillId: 'seed',
    subSkillName,
    context: '',
    complexity,
    status: done ? 'COMPLETED' : 'IN_PROGRESS',
    questions: [],
    rawPercent: percent,
    weightedPercent: percent,
    coinAllocationStatus: done ? 'ALLOCATED' : 'PENDING',
    coinsAwarded: done ? COIN_REWARD[complexity] : null,
    questionCount,
    createdAt,
    completedAt,
  }
}

const SEED: AssessmentListItem[] = [
  seed('a-101', 'Advanced Algorithms & Data Structures Final', 'Creativity & Innovation', 'Design Thinking', 'ADVANCED', 15, 92, '2024-10-14T10:00:00', '2024-10-14T11:45:00'),
  seed('a-102', 'Task deadline management', 'Time Management', 'Prioritization Techniques', 'FOUNDATION', 10, 95, '2024-09-28T16:00:00', '2024-09-28T17:15:00'),
  seed('a-103', 'Digital Ethics & AI Governance Milestone', 'Digital Use', 'Algorithmic Accountability', 'INTERMEDIATE', 15, 88, '2024-09-15T14:00:00', '2024-09-15T15:00:00'),
  seed('a-104', 'Team Communication Check-in', 'Communication', 'Active Listening', 'INTERMEDIATE', 15, null, '2024-09-10T09:00:00', null),
  seed('a-105', 'Problem Solving Sprint', 'Problem Solving', 'Root Cause Analysis', 'ADVANCED', 20, 81, '2024-09-02T13:00:00', '2024-09-02T14:20:00'),
  seed('a-106', 'Spreadsheet Basics Practice', 'Digital Use', 'Data Handling', 'FOUNDATION', 10, null, '2024-08-27T11:00:00', null),
  seed('a-107', 'Logic Puzzles Practice', 'Problem Solving', 'Logical Reasoning', 'FOUNDATION', 10, 20, '2024-08-20T10:00:00', '2024-08-20T10:25:00'),
]

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or blocked; mocks just won't persist.
  }
}

function created(): AssessmentListItem[] {
  return readJson<AssessmentListItem[]>(STORE_KEY, [])
}

function allAssessments(): AssessmentListItem[] {
  return [...created(), ...SEED]
}

function saveCreated(items: AssessmentListItem[]) {
  writeJson(STORE_KEY, items)
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), DELAY_MS))
}

function notFound(): never {
  throw new ApiError('Test not found', 404)
}

// Placeholder grouping: every 2 questions count toward one competency, 10 pts each.
// The real mapping of questions to competencies comes from the backend.
const COMPETENCY_TEMPLATE = [
  { name: 'Design Thinking', evidence: ['User Persona Synthesis', 'Empathy Journey Mapping'] },
  { name: 'MVP Prototyping', evidence: ['Paper Wireframing', 'Minimum Viable Product'] },
  { name: 'Risk Mitigation', evidence: ['Failure Mode Matrix', 'Contingency Budgeting'] },
  { name: 'Ideation & Pitching', evidence: ['Value Proposition Pitch', 'Stakeholder Buy-in'] },
]
const POINTS_PER_QUESTION = 10

function competenciesFrom(correct: boolean[]) {
  return COMPETENCY_TEMPLATE.map((template, group) => {
    const answers = correct.slice(group * 2, group * 2 + 2)
    const pointsEarned = answers.filter(Boolean).length * POINTS_PER_QUESTION
    const pointsPossible = answers.length * POINTS_PER_QUESTION
    return {
      subSkillName: template.name,
      masteryPercent: pointsPossible ? (pointsEarned / pointsPossible) * 100 : 0,
      pointsEarned,
      pointsPossible,
      evidence: answers.map((_, i) => `Q${group * 2 + i + 1} ${template.evidence[i]}`),
    }
  }).filter((item) => item.pointsPossible > 0)
}

function reportFor(item: AssessmentListItem, correct?: boolean[], timeTakenSeconds?: number): AssessmentReport {
  const percent = item.weightedPercent ?? item.rawPercent ?? 0
  const total = Math.min(item.questionCount ?? item.questions.length, 8)
  const flags = correct ?? Array.from({ length: total }, (_, i) => i < Math.round((percent / 100) * total))
  const code = item.id.replace(/\W/g, '').toUpperCase()
  const started = new Date(item.createdAt).getTime()
  const finished = item.completedAt ? new Date(item.completedAt).getTime() : started
  return {
    assessment: item,
    correctAnswers: flags.filter(Boolean).length,
    totalQuestions: flags.length,
    studentName: 'Alex Morgan',
    studentId: 'SC-882194',
    coinsEarned: item.coinsAwarded ?? null,
    timeTakenSeconds: timeTakenSeconds ?? Math.max(0, Math.round((finished - started) / 1000)),
    competencies: competenciesFrom(flags),
    credential: {
      credentialId: `SC-CERT-${new Date(finished).getFullYear()}-${code.slice(-5)}`,
      ledgerHash: `0x${code.padEnd(8, '0').slice(0, 8)}9C2E4B1D`,
      anchored: true,
      verifiedBy: 'Academic Consensus Node',
    },
  }
}

export const assessmentMocks = {
  list() {
    return delay(allAssessments())
  },

  skills() {
    return delay(SKILLS)
  },

  async start(body: StartAssessmentRequest): Promise<Assessment> {
    const skill = SKILLS.find((item) => item.id === body.skillId)
    const subSkill = skill?.subSkills.find((item) => item.id === body.subSkillId)
    if (!skill || !subSkill) throw new ApiError('Pick a valid skill and sub-skill', 400)

    // The mock bank only has 8 questions, so longer tests are capped at 8.
    const count = Math.min(body.questionCount, QUESTION_BANK.length)
    const assessment: AssessmentListItem = {
      id: `mock-${Date.now()}`,
      title: `${skill.name.split(' - ')[0]}: ${subSkill.name}`,
      skillId: skill.id,
      skillName: skill.name.split(' - ')[0],
      subSkillId: subSkill.id,
      subSkillName: subSkill.name,
      context: body.context,
      complexity: body.complexity,
      status: 'IN_PROGRESS',
      questions: QUESTION_BANK.slice(0, count).map(({ questionId, type, prompt, options }) => ({
        questionId,
        type,
        prompt,
        options,
      })),
      rawPercent: null,
      weightedPercent: null,
      coinAllocationStatus: 'PENDING',
      coinsAwarded: null,
      questionCount: count,
      createdAt: new Date().toISOString(),
      completedAt: null,
    }
    saveCreated([assessment, ...created()])
    return delay(assessment)
  },

  async get(id: string): Promise<Assessment> {
    const item = allAssessments().find((entry) => entry.id === id)
    if (!item) notFound()
    return delay(item)
  },

  async submit(id: string, body: SubmitAnswersRequest): Promise<AssessmentReport> {
    const items = created()
    const index = items.findIndex((entry) => entry.id === id)
    if (index === -1) notFound()

    const item = items[index]
    const correctFlags = item.questions.map((question) => {
      const key = QUESTION_BANK.find((entry) => entry.questionId === question.questionId)
      return Boolean(key && body.responses[question.questionId] === key.options[key.answer])
    })
    const correct = correctFlags.filter(Boolean).length
    const total = item.questions.length
    const percent = total ? Math.round((correct / total) * 1000) / 10 : 0
    const timeTaken = Math.round(Object.values(body.timeSpentMs ?? {}).reduce((sum, ms) => sum + ms, 0) / 1000)

    const completed: AssessmentListItem = {
      ...item,
      status: 'COMPLETED',
      rawPercent: percent,
      weightedPercent: percent,
      coinAllocationStatus: 'ALLOCATED',
      coinsAwarded: percent >= 50 ? COIN_REWARD[item.complexity] : 0,
      completedAt: new Date().toISOString(),
    }
    items[index] = completed
    saveCreated(items)

    const report = reportFor(completed, correctFlags, timeTaken)
    writeJson(REPORT_KEY, { ...readJson<Record<string, AssessmentReport>>(REPORT_KEY, {}), [id]: report })
    return delay(report)
  },

  async report(id: string): Promise<AssessmentReport> {
    const saved = readJson<Record<string, AssessmentReport>>(REPORT_KEY, {})[id]
    if (saved) return delay(saved)
    const item = allAssessments().find((entry) => entry.id === id)
    if (!item || item.completedAt == null) notFound()
    return delay(reportFor(item))
  },
}
