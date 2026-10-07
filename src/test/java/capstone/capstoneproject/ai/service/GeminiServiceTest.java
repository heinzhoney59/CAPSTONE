package capstone.capstoneproject.ai.service;

import capstone.capstoneproject.ai.config.GeminiProperties;
import capstone.capstoneproject.ai.dto.GeminiGenerateContentResponse;
import java.time.Duration;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class GeminiServiceTest {

    @Test
    void rejectsMissingApiKeyBeforeCallingGemini() {
        GeminiService service = new GeminiService(
                RestClient.builder().build(),
                new GeminiProperties("", "https://example.com", "gemini-test", Duration.ofSeconds(5))
        );

        assertThatThrownBy(() -> service.chat("hello"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(exception -> ((ResponseStatusException) exception).getStatusCode())
                .isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
    }

    @Test
    void rejectsResponseWithoutAnswer() {
        GeminiService service = new GeminiService(
                RestClient.builder().build(),
                new GeminiProperties("test-key", "https://example.com", "gemini-test", Duration.ofSeconds(5))
        );

        assertThatThrownBy(() -> invokeExtractAnswer(service, new GeminiGenerateContentResponse(List.of())))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(exception -> ((ResponseStatusException) exception).getStatusCode())
                .isEqualTo(HttpStatus.BAD_GATEWAY);
    }

    private String invokeExtractAnswer(
            GeminiService service,
            GeminiGenerateContentResponse response
    ) {
        try {
            var method = GeminiService.class.getDeclaredMethod(
                    "extractAnswer",
                    GeminiGenerateContentResponse.class
            );
            method.setAccessible(true);
            return (String) method.invoke(service, response);
        } catch (ReflectiveOperationException exception) {
            if (exception.getCause() instanceof RuntimeException runtimeException) {
                throw runtimeException;
            }
            throw new IllegalStateException(exception);
        }
    }
}
