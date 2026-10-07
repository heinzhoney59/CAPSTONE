package capstone.capstoneproject.ai.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "gemini")
public record GeminiProperties(
        String apiKey,
        String baseUrl,
        String model,
        Duration timeout
) {
    public GeminiProperties {
        apiKey = apiKey == null ? "" : apiKey;
        baseUrl = baseUrl == null || baseUrl.isBlank()
                ? "https://generativelanguage.googleapis.com"
                : baseUrl;
        model = model == null || model.isBlank() ? "gemini-2.5-flash" : model;
        timeout = timeout == null ? Duration.ofSeconds(30) : timeout;
    }
}
