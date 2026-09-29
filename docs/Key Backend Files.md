## Key Backend Files

## Question Bank / Assessment

- `AssessmentService.java`
  Main assessment logic. Selects suitable question-bank questions first, prefers unseen questions, reuses suitable seen questions if needed, and only uses the existing LLM fallback when the bank is insufficient.

- `QuestionRepository.java`
  Provides access to MongoDB question-bank records by skill, sub-skill, complexity and active status.

- `Question.java`
  Defines the question data model, including prompt, options, answer, complexity, age/year range, source and active status.

- `AssessmentController.java`
  Handles assessment API requests and delegates assessment creation/submission to `AssessmentService`.

- `AssessmentAttempt.java`
  Stores assessment attempts and question snapshots for student results/history.

- `kanavoogle_seed_questions_v2.js`
  Seeds the Phase 1 question bank with the prepared MongoDB question set.

- `AssessmentServiceTest.java`
  Tests question-bank selection, reuse, shortage behaviour, completion and that the LLM is not called when enough bank questions exist.

### LLM
- `LlmQuestionClient.java`  
  Defines the abstraction for generating questions through an LLM.

- `OpenAiCompatibleLlmClient.java`  
  Implements the OpenAI-compatible `/chat/completions` client and parses generated questions.

- `OpenAiCompatibleLlmClientTest.java`  
  Tests request configuration and malformed LLM responses using a mock HTTP server.

### Configuration
- `AppProperties.java`  
  Maps application configuration such as LLM settings.

- `application.yml`  
  Main Spring Boot configuration.

### Database / Seed
- `kanavoogle_seed_questions_v2.js`  
  Seeds the Phase 1 MongoDB question bank.

### Frontend
- `AssessmentSetupPage.tsx`  
  Allows students to configure and start an assessment.