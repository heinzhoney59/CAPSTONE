package capstone.capstoneproject.ocr;

import capstone.capstoneproject.ai.config.GeminiProperties;
import capstone.capstoneproject.ai.dto.GeminiGenerateContentRequest;
import capstone.capstoneproject.ai.dto.GeminiGenerateContentResponse;
import java.math.BigDecimal;
import java.util.Base64;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

@Component
public class GeminiOcrProvider implements OcrProvider {

    private final RestClient restClient;
    private final GeminiProperties properties;

    public GeminiOcrProvider(
            RestClient geminiRestClient,
            GeminiProperties properties
    ) {
        this.restClient = geminiRestClient;
        this.properties = properties;
    }

    @Override
    public List<OcrIngredientCandidate> extract(byte[] imageBytes, String contentType) {
        if (properties.apiKey() == null || properties.apiKey().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "GEMINI_API_KEY가 설정되지 않았습니다."
            );
        }

        String prompt = """
                이미지에서 보이는 영수증 또는 장보기 품목을 추출하세요.
                각 품목을 표준 재료명, 수량, 단위로 정리하세요.
                불필요한 텍스트는 제외하고 다음 JSON 배열만 반환하세요.
                [{"ingredientName":"콩나물","quantity":500,"unit":"GRAM"}]
                단위는 PIECE, GRAM, MILLILITER 중 하나만 사용하세요.
                수량을 알 수 없으면 1을 사용하세요.
                """;

        String base64 = Base64.getEncoder().encodeToString(imageBytes);
        GeminiGenerateContentRequest request = new GeminiGenerateContentRequest(List.of(
                new GeminiGenerateContentRequest.Content(List.of(
                        new GeminiGenerateContentRequest.Part(prompt),
                        new GeminiGenerateContentRequest.Part(
                                new GeminiGenerateContentRequest.Part.InlineData(
                                        contentType,
                                        base64
                                )
                        )
                ))
        ));

        GeminiGenerateContentResponse response;
        try {
            response = restClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v1beta/models/{model}:generateContent")
                            .queryParam("key", properties.apiKey())
                            .build(properties.model()))
                    .body(request)
                    .retrieve()
                    .body(GeminiGenerateContentResponse.class);
        } catch (RuntimeException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Gemini OCR 호출에 실패했습니다.",
                    exception
            );
        }

        String text = extractText(response);
        return parseCandidates(text);
    }

    private String extractText(GeminiGenerateContentResponse response) {
        if (response == null
                || response.candidates() == null
                || response.candidates().isEmpty()
                || response.candidates().get(0).content() == null
                || response.candidates().get(0).content().parts() == null
                || response.candidates().get(0).content().parts().isEmpty()
                || response.candidates().get(0).content().parts().get(0).text() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "OCR 결과가 없습니다.");
        }
        return response.candidates().get(0).content().parts().get(0).text();
    }

    private List<OcrIngredientCandidate> parseCandidates(String text) {
        List<OcrIngredientCandidate> candidates = new ArrayList<>();
        Pattern objectPattern = Pattern.compile("\\{[^{}]*\\}");
        Matcher objectMatcher = objectPattern.matcher(text);
        while (objectMatcher.find()) {
            String object = objectMatcher.group();
            String name = jsonString(object, "ingredientName");
            if (name == null || name.isBlank()) {
                continue;
            }
            BigDecimal quantity = jsonDecimal(object, "quantity");
            String unit = jsonString(object, "unit");
            if (unit == null
                    || (!unit.equals("PIECE") && !unit.equals("GRAM") && !unit.equals("MILLILITER"))) {
                unit = "PIECE";
            }
            candidates.add(new OcrIngredientCandidate(
                    name,
                    quantity == null ? BigDecimal.ONE : quantity,
                    unit
            ));
        }
        if (candidates.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "OCR 결과를 해석하지 못했습니다.");
        }
        return candidates;
    }

    private String jsonString(String object, String field) {
        Pattern pattern = Pattern.compile("\"" + field + "\"\\s*:\\s*\"([^\"]*)\"");
        Matcher matcher = pattern.matcher(object);
        return matcher.find() ? matcher.group(1) : null;
    }

    private BigDecimal jsonDecimal(String object, String field) {
        Pattern pattern = Pattern.compile("\"" + field + "\"\\s*:\\s*(\\d+(?:\\.\\d+)?)");
        Matcher matcher = pattern.matcher(object);
        if (!matcher.find()) {
            return null;
        }
        try {
            return new BigDecimal(matcher.group(1));
        } catch (NumberFormatException exception) {
            return null;
        }
    }
}
