package capstone.capstoneproject.ai.controller;

import capstone.capstoneproject.ai.dto.GeminiChatRequest;
import capstone.capstoneproject.ai.dto.GeminiChatResponse;
import capstone.capstoneproject.ai.service.GeminiService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class GeminiController {

    private final GeminiService geminiService;

    public GeminiController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/chat")
    public GeminiChatResponse chat(@Valid @RequestBody GeminiChatRequest request) {
        return geminiService.chat(request.prompt());
    }
}
