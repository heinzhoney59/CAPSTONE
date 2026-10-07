package capstone.capstoneproject.ai.service;

import capstone.capstoneproject.ai.config.GeminiProperties;
import capstone.capstoneproject.ai.dto.GeminiChatResponse;
import capstone.capstoneproject.ai.dto.GeminiGenerateContentRequest;
import capstone.capstoneproject.ai.dto.GeminiGenerateContentResponse;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

@Service
public class GeminiService {

    private final RestClient restClient;
    private final GeminiProperties properties;

    public GeminiService(RestClient geminiRestClient, GeminiProperties properties) {
        this.restClient = geminiRestClient;
        this.properties = properties;
    }

    public GeminiChatResponse chat(String prompt) {
        if (properties.apiKey() == null || properties.apiKey().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "GEMINI_API_KEY가 설정되지 않았습니다."
            );
        }

        GeminiGenerateContentResponse response;
        try {
            response = restClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v1beta/models/{model}:generateContent")
                            .queryParam("key", properties.apiKey())
                            .build(properties.model()))
                    .body(new GeminiGenerateContentRequest(List.of(
                            new GeminiGenerateContentRequest.Content(List.of(
                                    new GeminiGenerateContentRequest.Part(prompt)
                            ))
                    )))
                    .retrieve()
                    .body(GeminiGenerateContentResponse.class);
        } catch (RuntimeException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Gemini API 호출에 실패했습니다.",
                    exception
            );
        }

        String answer = extractAnswer(response);
        return new GeminiChatResponse(properties.model(), answer);
    }

    private String extractAnswer(GeminiGenerateContentResponse response) {
        if (response == null
                || response.candidates() == null
                || response.candidates().isEmpty()
                || response.candidates().get(0).content() == null
                || response.candidates().get(0).content().parts() == null
                || response.candidates().get(0).content().parts().isEmpty()
                || response.candidates().get(0).content().parts().get(0).text() == null
                || response.candidates().get(0).content().parts().get(0).text().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Gemini API 응답에 답변이 없습니다."
            );
        }
        return response.candidates().get(0).content().parts().get(0).text();
    }
}
