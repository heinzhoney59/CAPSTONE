package capstone.capstoneproject.ocr;

import capstone.capstoneproject.ai.config.GeminiProperties;
import java.lang.reflect.Method;
import java.time.Duration;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class GeminiOcrProviderTest {

    @Test
    void rejectsMissingApiKeyBeforeCallingGemini() {
        GeminiOcrProvider provider = new GeminiOcrProvider(
                RestClient.builder().build(),
                new GeminiProperties("", "https://example.com", "ocr-test", Duration.ofSeconds(5))
        );

        assertThatThrownBy(() -> provider.extract(new byte[]{1, 2, 3}, "image/jpeg"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(exception -> ((ResponseStatusException) exception).getStatusCode())
                .isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
    }

    @Test
    void parsesValidJsonCandidatesAndDefaultsInvalidUnitAndQuantity() {
        GeminiOcrProvider provider = new GeminiOcrProvider(
                RestClient.builder().build(),
                new GeminiProperties("test-key", "https://example.com", "ocr-test", Duration.ofSeconds(5))
        );

        List<OcrIngredientCandidate> candidates = invokeParseCandidates(
                provider,
                """
                [{"ingredientName":"콩나물","quantity":500,"unit":"GRAM"},
                 {"ingredientName":"계란","unit":"UNKNOWN"}]
                """
        );

        assertThat(candidates).hasSize(2);
        assertThat(candidates.get(0).ingredientName()).isEqualTo("콩나물");
        assertThat(candidates.get(0).quantity()).isEqualByComparingTo("500");
        assertThat(candidates.get(0).unit()).isEqualTo("GRAM");
        assertThat(candidates.get(1).quantity()).isEqualByComparingTo("1");
        assertThat(candidates.get(1).unit()).isEqualTo("PIECE");
    }

    @SuppressWarnings("unchecked")
    private List<OcrIngredientCandidate> invokeParseCandidates(
            GeminiOcrProvider provider,
            String text
    ) {
        try {
            Method method = GeminiOcrProvider.class.getDeclaredMethod(
                    "parseCandidates",
                    String.class
            );
            method.setAccessible(true);
            return (List<OcrIngredientCandidate>) method.invoke(provider, text);
        } catch (ReflectiveOperationException exception) {
            if (exception.getCause() instanceof RuntimeException runtimeException) {
                throw runtimeException;
            }
            throw new AssertionError(exception);
        }
    }
}
