package com.kanavoogle.skills.assessment;

import com.kanavoogle.skills.common.ApiExceptionHandler;
import com.kanavoogle.skills.llm.LlmQuestionClient;
import com.kanavoogle.skills.security.AuthenticatedUser;
import com.kanavoogle.skills.taxonomy.*;
import com.kanavoogle.skills.user.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AssessmentServiceTest {
    // Mock all external dependencies so these tests exercise AssessmentService only.
    // No real MongoDB or external LLM service is used.
    private final AssessmentAttemptRepository attempts = mock(AssessmentAttemptRepository.class);
    private final QuestionRepository questions = mock(QuestionRepository.class);
    private final SkillRepository skills = mock(SkillRepository.class);
    private final UserRepository users = mock(UserRepository.class);
    private final LlmQuestionClient llm = mock(LlmQuestionClient.class);
    private final AssessmentService service = new AssessmentService(attempts, questions, skills, users, llm);
    private static final String SHORTAGE = "Not enough approved questions for this configuration. "
            + "Enable LLM integration or add question-bank content.";

    // Build a standard authenticated student, skill and saved-assessment context for each test.
    @BeforeEach
    void setup() {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                new AuthenticatedUser("student", "student@example.test", Role.STUDENT), null));
        UserAccount user = new UserAccount();
        user.setId("student");
        user.setRole(Role.STUDENT);
        var profile = new UserAccount.StudentProfile();
        profile.setAge(15);
        profile.setYearLevel(9);
        user.setStudentProfile(profile);
        when(users.findById("student")).thenReturn(Optional.of(user));
        Skill skill = new Skill();
        skill.setId("skill");
        skill.setName("Skill");
        skill.setSubSkills(List.of(new Skill.SubSkill("sub", "Sub-skill")));
        when(skills.findById("skill")).thenReturn(Optional.of(skill));
        when(attempts.save(any())).thenAnswer(call -> {
            AssessmentAttempt attempt = call.getArgument(0);
            attempt.setId("assessment");
            when(attempts.findById("assessment")).thenReturn(Optional.of(attempt));
            return attempt;
        });
    }

    // Remove authentication state after each test so tests remain isolated.
    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    // Creates reusable valid question-bank records for test scenarios.
    private List<Question> bank(int count) {
        return IntStream.range(0, count).mapToObj(i -> {
            Question q = new Question();
            q.setId("q" + i);
            q.setSkillId("skill");
            q.setSubSkillId("sub");
            q.setComplexity(Complexity.FOUNDATION);
            q.setType(QuestionType.MULTIPLE_CHOICE);
            q.setPrompt("Choose the correct answer");
            q.setOptions(List.of("A", "B", "C", "D"));
            q.setCorrectAnswer("A");
            return q;
        }).toList();
    }

    // Makes the mocked question repository return the supplied bank content.
    private void returns(List<Question> bank) {
        when(questions.findBySkillIdAndSubSkillIdAndComplexityAndActiveTrue(
                "skill", "sub", Complexity.FOUNDATION)).thenReturn(bank);
    }

    // Creates a standard assessment request with a configurable question count.
    private AssessmentService.Create request(int count) {
        return new AssessmentService.Create("skill", "sub", "General", Complexity.FOUNDATION, count);
    }

    // Main question-bank path: enough suitable questions should satisfy the request
    // without consulting the LLM client.
    @ParameterizedTest
    @ValueSource(ints = {3, 5, 7, 10, 15})
    void enoughBankQuestionsReturnExactCountWithoutConsultingLlm(int count) {
        returns(bank(15));
        var result = service.create(request(count));
        assertThat(result.id()).isEqualTo("assessment");
        assertThat(result.questions()).hasSize(count);
        assertThat(result.questions()).extracting(AssessmentService.QView::questionId).doesNotHaveDuplicates();
        verify(questions).findBySkillIdAndSubSkillIdAndComplexityAndActiveTrue("skill", "sub", Complexity.FOUNDATION);
        verifyNoMoreInteractions(questions);
        verifyNoInteractions(llm);
    }

    // Prefer questions the student has not seen in recent assessments.
    @Test
    void prefersUnseenQuestions() {
        var bank = bank(6);
        returns(bank);
        seen(bank.subList(0, 3));
        assertThat(service.create(request(3)).questions()).extracting(AssessmentService.QView::questionId)
                .containsExactlyInAnyOrder("q3", "q4", "q5");
        verifyNoInteractions(llm);
    }

    // Marks selected questions as recently seen by creating a previous assessment attempt.
    private void seen(List<Question> bank) {
        var previous = new AssessmentAttempt();
        previous.setQuestions(bank.stream().map(AssessmentAttempt.QuestionSnapshot::from).toList());
        when(attempts.findTop10ByStudentIdOrderByCreatedAtDesc("student")).thenReturn(List.of(previous));
    }

    // If unseen questions are insufficient, suitable previously seen bank questions
    // are reused before the existing LLM fallback is considered.
    @Test
    void reusesSuitableSeenBankQuestionsEvenWhenLlmIsEnabled() {
        when(llm.enabled()).thenReturn(true);
        var bank = bank(7);
        bank.get(3).setAgeMin(16);
        bank.get(4).setAgeMax(14);
        bank.get(5).setYearMin(10);
        bank.get(6).setYearMax(8);
        returns(bank);
        seen(bank);
        assertThat(service.create(request(3)).questions()).extracting(AssessmentService.QView::questionId)
                .containsExactlyInAnyOrder("q0", "q1", "q2");
        verifyNoInteractions(llm);
    }

    // Age/year-incompatible bank questions must not be used to fill a shortage.
    @Test
    void unsuitableQuestionsCannotFillShortageWhenLlmIsDisabled() {
        var bank = bank(4);
        bank.get(2).setAgeMin(16);
        bank.get(3).setYearMax(8);
        returns(bank);
        assertThatThrownBy(() -> service.create(request(3))).isInstanceOf(IllegalStateException.class)
                .hasMessage(SHORTAGE);
        verify(attempts, never()).save(any());
        verify(llm).enabled();
        verifyNoMoreInteractions(llm);
        verify(questions, never()).save(any());
    }

    // Preserve the existing fallback: when bank content is short and LLM is enabled,
    // only the missing number of questions is requested from the mocked client.
    @Test
    void existingShortageFallbackStillUsesClientWhenEnabledButOnlyAMockInTests() {
        returns(bank(2));
        when(llm.enabled()).thenReturn(true);
        when(llm.generate(any())).thenReturn(List.of());
        assertThatThrownBy(() -> service.create(request(3))).hasMessage(SHORTAGE);
        verify(llm).generate(new LlmQuestionClient.Request(15, 9, "Skill", "Sub-skill", "General",
                Complexity.FOUNDATION, 1));
        verify(attempts, never()).save(any());
    }

    // Valid generated questions should fill only the shortage and keep the requested metadata
    // before being saved for later reuse.
    @Test
    void fillsOnlyShortageAndPreservesQuestionMetadata() {
        returns(bank(2));
        when(llm.enabled()).thenReturn(true);
        when(llm.generate(any())).thenReturn(List.of(new LlmQuestionClient.GeneratedQuestion(
                "MULTIPLE_CHOICE", "Choose the correct answer", List.of("A", "B", "C", "D"), "A", "A is correct.")));
        when(questions.save(any())).thenAnswer(call -> {
            Question q = call.getArgument(0);
            assertThat(q.getSkillId()).isEqualTo("skill");
            assertThat(q.getSubSkillId()).isEqualTo("sub");
            assertThat(q.getContext()).isEqualTo("General");
            assertThat(q.getComplexity()).isEqualTo(Complexity.FOUNDATION);
            assertThat(q.getSource()).isEqualTo("LLM_VALIDATED");
            assertThat(q.isActive()).isTrue();
            q.setId("generated");
            return q;
        });
        assertThat(service.create(request(3)).questions()).extracting(AssessmentService.QView::questionId)
                .containsExactlyInAnyOrder("q0", "q1", "generated");
        verify(llm).generate(new LlmQuestionClient.Request(15, 9, "Skill", "Sub-skill", "General", Complexity.FOUNDATION, 1));
        verify(questions).save(any());
    }

    // Invalid generated questions must be rejected and must never be persisted.
    @Test
    void malformedGeneratedQuestionsAreNeverSaved() {
        returns(bank(2));
        when(llm.enabled()).thenReturn(true);
        when(llm.generate(any())).thenReturn(List.of(
                new LlmQuestionClient.GeneratedQuestion("MULTIPLE_CHOICE", "Choose the correct answer", List.of("A", "A", "C", "D"), "A", "Explanation"),
                new LlmQuestionClient.GeneratedQuestion("MULTIPLE_CHOICE", "Choose the correct answer", Arrays.asList("A", null, "C", "D"), "A", "Explanation"),
                new LlmQuestionClient.GeneratedQuestion("MULTIPLE_CHOICE", "Choose the correct answer", List.of("A", "B", "C", "D"), "Z", "Explanation"),
                new LlmQuestionClient.GeneratedQuestion("MULTIPLE_CHOICE", "Choose the correct answer", List.of("A", "B", "C", "D"), "A", ""),
                new LlmQuestionClient.GeneratedQuestion("TRUE_FALSE", "Choose the correct answer", List.of("True", "False"), "Maybe", "Explanation")));
        assertThatThrownBy(() -> service.create(request(3))).hasMessage(SHORTAGE);
        verify(questions, never()).save(any());
        verify(attempts, never()).save(any());
    }

    // End-to-end service check for the bank-only path: create, answer and complete an assessment
    // without any LLM interaction.
    @Test
    void questionBankAssessmentCanBeCompletedWithoutModelCalls() {
        returns(bank(5));
        var created = service.create(request(5));
        var answers = created.questions().stream().collect(Collectors.toMap(AssessmentService.QView::questionId, q -> "A"));
        var result = service.submit(created.id(), new AssessmentService.Submit(answers));
        assertThat(result.assessment().status()).isEqualTo("COMPLETED");
        assertThat(result.correctAnswers()).isEqualTo(5);
        assertThat(result.totalQuestions()).isEqualTo(5);
        assertThat(result.assessment().rawPercent()).isEqualTo(100.0);
        verifyNoInteractions(llm);
    }

    // When the bank cannot satisfy the request, keep the existing readable HTTP 400 response.
    @Test
    void shortageKeepsExistingReadableHttp400() throws Exception {
        returns(bank(0));
        MockMvcBuilders.standaloneSetup(new AssessmentController(service))
                .setControllerAdvice(new ApiExceptionHandler()).build()
                .perform(post("/api/assessments").contentType("application/json").content("""
                        {"skillId":"skill","subSkillId":"sub","context":"General",
                         "complexity":"FOUNDATION","questionCount":3}
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(SHORTAGE));
        verify(llm, never()).generate(any());
    }
}
