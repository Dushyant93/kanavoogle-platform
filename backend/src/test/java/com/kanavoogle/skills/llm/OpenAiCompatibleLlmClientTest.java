package com.kanavoogle.skills.llm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kanavoogle.skills.assessment.Complexity;
import com.kanavoogle.skills.config.AppProperties;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.http.*;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class OpenAiCompatibleLlmClientTest {
    // Test fixtures used by all LLM client tests.
    // The mock HTTP server intercepts requests so no real LLM provider is called.
    private final ObjectMapper mapper = new ObjectMapper();
    private final AppProperties properties = new AppProperties();
    private final RestClient.Builder builder = RestClient.builder();
    private final MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
    private final OpenAiCompatibleLlmClient client = new OpenAiCompatibleLlmClient(properties, mapper, builder);
    private final LlmQuestionClient.Request request = new LlmQuestionClient.Request(
            15, 9, "Skill", "Sub-skill", "General", Complexity.FOUNDATION, 1);

    // Configure a fake but complete LLM setup before each test.
    @BeforeEach
    void setup() {
        properties.getLlm().setEnabled(true);
        properties.getLlm().setApiKey("test-placeholder");
        properties.getLlm().setBaseUrl("https://llm.example.test/v1");
        properties.getLlm().setModel("configured-model");
    }

    // Verify that every expected mock HTTP request was actually made.
    @AfterEach
    void verifyRequests() {
        server.verify();
    }

    // Verifies the normal path: correct URL, headers and request body are sent,
    // then a valid JSON response is converted into GeneratedQuestion objects.
    @Test
    void sendsConfiguredRequestAndParsesJson() throws Exception {
        server.expect(requestTo("https://llm.example.test/v1/chat/completions"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header(HttpHeaders.AUTHORIZATION, "Bearer test-placeholder"))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.model").value("configured-model"))
                .andExpect(jsonPath("$.response_format.type").value("json_object"))
                .andExpect(jsonPath("$.messages[1].content").value(
                        "Create 1 questions for age 15, Year 9. Skill: Skill. Sub-skill: Sub-skill. Context: General. Complexity: FOUNDATION"))
                .andRespond(withSuccess(envelope("""
                        {"questions":[{"type":"MULTIPLE_CHOICE","prompt":"Choose the correct answer",
                        "options":["A","B","C","D"],"correctAnswer":"A","explanation":"A is correct."}]}
                        """), MediaType.APPLICATION_JSON));
        assertThat(client.generate(request)).containsExactly(new LlmQuestionClient.GeneratedQuestion(
                "MULTIPLE_CHOICE", "Choose the correct answer", List.of("A", "B", "C", "D"), "A", "A is correct."));
    }

    // When the LLM is disabled or the API key is missing, the client must not call the provider.
    @Test
    void disabledOrMissingKeyNeverCallsApi() {
        properties.getLlm().setEnabled(false);
        assertThat(client.generate(request)).isEmpty();
        properties.getLlm().setEnabled(true);
        properties.getLlm().setApiKey(" ");
        assertThat(client.enabled()).isFalse();
        assertThat(client.generate(request)).isEmpty();
    }

    // Reject malformed model output such as markdown fences, missing fields,
    // invalid question arrays, invalid options or wrong field types.
    @ParameterizedTest
    @ValueSource(strings = {
            "```json\n{\"questions\":[]}\n```", "null", "{}", "{\"questions\":{}}",
            "{\"questions\":[]} trailing", "{\"questions\":[{}]}",
            "{\"questions\":[{\"options\":[null]}]}",
            "{\"questions\":[{\"options\":[],\"type\":123}]}"
    })
    void rejectsMalformedContent(String content) throws Exception {
        server.expect(requestTo("https://llm.example.test/v1/chat/completions"))
                .andRespond(withSuccess(envelope(content), MediaType.APPLICATION_JSON));
        assertThatThrownBy(() -> client.generate(request)).isInstanceOf(IllegalStateException.class)
                .hasMessage("LLM response could not be parsed");
    }

    // Reject provider responses that do not contain a completion message.
    @Test
    void rejectsMissingCompletion() {
        server.expect(requestTo("https://llm.example.test/v1/chat/completions"))
                .andRespond(withSuccess("{\"choices\":[]}", MediaType.APPLICATION_JSON));
        assertThatThrownBy(() -> client.generate(request)).isInstanceOf(IllegalStateException.class);
    }

    // Helper that wraps generated content in the OpenAI-compatible response structure.
    private String envelope(String content) throws Exception {
        return mapper.writeValueAsString(Map.of("choices", List.of(Map.of("message", Map.of("content", content)))));
    }
}
