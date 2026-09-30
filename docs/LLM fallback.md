### Existing LLM fallback

- Assessment first uses matching MongoDB question-bank questions.
- Only when questions are insufficient, and LLM is enabled with a valid API key, the backend calls the existing `/chat/completions` integration.
- Generated questions are validated and saved as `LLM_VALIDATED` for later reuse.
- Local config uses `LLM_ENABLED`, `LLM_BASE_URL`, `LLM_API_KEY`, and `LLM_MODEL`; real keys must not be committed.
- Automated tests use mocks only and do not call OpenAI or the real database.

**Current priority:** use the question bank first; keep the existing LLM fallback for future shortages.
