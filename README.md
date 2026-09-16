# Kanavoogle Digital Skills Platform

Full-stack Phase 1 starter based on the requirements refined for the project.

## Included

- Java 21 + Spring Boot REST backend
- MongoDB persistence
- Spring Cache + Caffeine for skills/sub-skills loaded from MongoDB
- Separate Student, School and Employer registration flows
- HttpOnly JWT authentication and server-side RBAC
- React + TypeScript frontend with professional navy/charcoal/white styling
- Student assessment setup: Skill -> Sub-skill -> Context -> Complexity -> Question count
- Approved question repository, question history and repeat avoidance
- OpenAI-compatible LLM integration for missing questions
- Generated-question validation before delivery
- Initial complexity-aware scoring foundation
- Digital Skills Wallet evidence foundation
- School and Employer Phase 2 dashboard placeholders
- Credential proof abstraction ready to replace with Hyperledger Fabric
- Docker Compose for MongoDB, backend and frontend

The database is seeded with all 7 stakeholder-provided skills and 52 sub-skills. Phase 1 assessment content is intentionally narrower. The coin-allocation algorithm is left pending because the stakeholder weighting and coin rules are still being refined.

## Run

```bash
cp .env.example .env
docker compose up --build
```

Open http://localhost:8088

The application works with seeded questions while `LLM_ENABLED=false`. To enable server-side question generation, add `LLM_API_KEY`, set `LLM_ENABLED=true`, and configure the model/provider in `.env`.

See `docs/SECURITY.md` and `docs/PHASE2.md` for design notes and extension points.
