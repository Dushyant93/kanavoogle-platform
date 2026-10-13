# Assessment screens

Student assessment flow:

| Screen | URL | Backend |
|---|---|---|
| My Tests | `/tests` | `GET /api/assessments` |
| Start Test | `/tests/new` | `GET /api/skills`, `POST /api/assessments` |
| Questions | `/tests/take?id=<id>` | `GET /api/assessments/{id}` |
| Test Complete | `/tests/complete?id=<id>` | uses the submitted result |
| Test Report | `/tests/result?id=<id>` | `GET /api/assessments/{id}/result` |

All requests go through `src/services/http.ts`, include the HttpOnly session cookie, and use `/api/...`.

## Real API vs mocks

The real backend is the default, including during local development. Mocks are only enabled when this is set explicitly:

```env
VITE_USE_MOCKS=true
```

Do not set that flag when integration-testing the Spring Boot backend.

## Assessment configuration

The frontend sends:

```json
{
  "skillId": "digital-use",
  "subSkillId": "ai-tool-literacy",
  "context": "Digital safety",
  "complexity": "INTERMEDIATE",
  "questionCount": 10
}
```

Age and year level come from the authenticated student's profile. The current UI caps a test at 10 questions because the approved bank has 10 questions per sub-skill/complexity in the full seed file. The backend accepts 3–15.

The scoring-to-coin and complexity-weighting rules are intentionally not invented in the frontend. The backend currently returns raw assessment performance and leaves `weightedPercent`/coin allocation pending until the stakeholder confirms those rules.

## Security expectations

- Assessment endpoints are STUDENT-only on the backend.
- Assessment ownership is checked server-side.
- `GET /api/assessments/{id}` never exposes the question's correct answer or explanation.
- A `403` is treated as an access/security error, not as a missing endpoint.
