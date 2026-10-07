# Assessment screens (Arjun)

Five student screens: My Tests, Start Test, Questions, Test Complete and Test Report.

After **Submit**, the student sees **Test Complete**: a positive remark and how many they got right, then **View Report** for the full report. There are no letter grades. Below 30% (`LOW_SCORE_PERCENT` in `assessmentFormat.ts`) the score is hidden and only encouragement is shown.

The number of questions comes from the student's age at registration, not from the Start Test screen: 13–14 → 10, 15–16 → 15, 17–19 → 20. Change `QUESTIONS_BY_AGE` in `assessmentFormat.ts` to adjust. For now every test has at most `MAX_QUESTIONS_PER_TEST` (10) questions: the question bank has 10 per sub-skill and level, and the backend allows 3 to 15. Raise it once the bank and the backend limit grow.

| Screen | URL | File |
|---|---|---|
| My Tests | `/tests` | `AssessmentList.tsx` |
| Start Test | `/tests/new` | `AssessmentConfig.tsx` |
| Questions | `/tests/take?id=<id>` | `AssessmentQuestions.tsx` |
| Test Complete | `/tests/complete?id=<id>` | `AssessmentComplete.tsx` |
| Test Report | `/tests/result?id=<id>` | `AssessmentResult.tsx` |

## Merging with the other screens

Everything lives in new files, so it won't clash with anyone else's work:

- `src/pages/assessments/` — the screens, layout, routes and URL helpers
- `src/hooks/useAssessmentFlow.ts` — data hooks the screens use
- `src/services/assessmentFlowService.ts` — API calls
- `src/services/mocks/assessmentMocks.ts` — sample data for local dev
- `src/types/assessmentFlow.ts` — types for these screens
- `src/styles/assessment.css` — styles (all classes start with `tests-`)

The only shared file touched is `App.tsx`, with an import and two lines:

```tsx
const AssessmentPage = assessmentRoutes[path]
if (AssessmentPage) return <AssessmentPage />
```

To link to these screens from another page, use the helpers instead of typing URLs:

```tsx
import { assessmentPaths } from '../assessments/paths'
<a href={assessmentPaths.start}>Start New Test</a>
<a href={assessmentPaths.result(id)}>View result</a>
```

The header shows the logged-in user from the shared `AuthProvider`. Until `main.tsx` wraps the app in `<AuthProvider>`, dev mode shows a sample student.

## Mock data vs real backend

In local dev (`npm run dev`) the screens use mock data, so they work without a backend. To use the real API, create `.env.local` with:

```
VITE_USE_MOCKS=false
```

Production builds always use the real API. All calls go through the shared `http.ts`, so they hit `/api/...` with cookies included. Pointing `/api` at the backend is done once for the whole app (e.g. a `server.proxy` entry in `vite.config.ts`).

## API the screens expect

The types are in `src/types/assessmentFlow.ts` and build on the shared `Assessment`, `Skill` and `AssessmentResult` types. Fields marked optional can be left out; the screen hides that part.

**`GET /api/assessments`** (not in the backend yet): the student's assessments, newest first. Until it exists, My Tests falls back to **`GET /api/assessments/recent`** (latest 10). Returns `AssessmentListItem[]`, which is `Assessment` plus these optional fields:

```json
{ "title": "Task deadline management", "questionCount": 40, "coinsAwarded": 1 }
```

An assessment counts as Confirmed when `completedAt` is set and `weightedPercent` (or `rawPercent`) is set. Anything else shows as Pending.

**`GET /api/skills`**: the existing skills endpoint. Returns `Skill[]` with `subSkills`.

**`POST /api/assessments`**: the existing create endpoint. Body is `CreateAssessment` plus `ageGroup`:

```json
{ "skillId": "skill-cr", "subSkillId": "cr-1", "complexity": "INTERMEDIATE",
  "questionCount": 45, "context": "", "ageGroup": "15-16" }
```

Returns the new `Assessment`. The screen then goes to `/tests/take?id=<id>`.

**`GET /api/assessments/:id`**: the existing endpoint. Returns `Assessment` with `questions`. Only send questions that passed the validator, and never include the correct answers.

The Questions screen handles all three backend question types: `MULTIPLE_CHOICE` (option buttons), `TRUE_FALSE` (True / False buttons, also when `options` is empty) and `SHORT_TEXT` (a text box). Answers are trimmed before submit; the backend needs every question answered.

**`POST /api/assessments/:id/submit`**: the same endpoint `resultsService` uses, with time per question added:

```json
{ "responses": { "q1": "Ask current students what would make them join" },
  "timeSpentMs": { "q1": 14250 } }
```

Returns `AssessmentReport` (below).

**`GET /api/assessments/:id/result`** (not in the backend yet): returns `AssessmentReport` so the result can be reopened later from the list. Until it exists, the screen uses the result saved at submit time, or builds a basic report (score and correct count) from `GET /api/assessments/:id`.

A missing endpoint comes back from the backend as 404/405, or as an empty 403 because of the JWT filter. The screens treat all three as "not there yet" and use the fallback. The fallback calls check access the same way, so a real access problem still shows as an error.

`AssessmentReport` is the shared `AssessmentResult` plus these optional fields:

```json
{
  "assessment": { "...": "Assessment" },
  "correctAnswers": 8,
  "totalQuestions": 8,
  "studentName": "Alex Morgan",
  "studentId": "SC-882194",
  "coinsEarned": 3,
  "timeTakenSeconds": 795,
  "competencies": [
    { "subSkillName": "Design Thinking", "masteryPercent": 100, "pointsEarned": 20, "pointsPossible": 20,
      "evidence": ["Q1 User Persona Synthesis", "Q2 Empathy Journey Mapping"] }
  ]
}
```

If `timeTakenSeconds` is missing, it uses `completedAt − createdAt`. If `coinsEarned` is missing, the report shows the coin status from `coinAllocationStatus`; any `PENDING_...` status shows as "Skill Coins pending".

The mock competency grouping (two questions per competency, 10 points each) is only a placeholder. The real mapping of questions to competencies and points should come from the backend.

"Back to Vault" links to `/my-vault`, the My Vault screen someone else is building.
