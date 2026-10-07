package capstone.capstoneproject.ai.dto;

import jakarta.validation.constraints.NotBlank;

public record GeminiChatRequest(@NotBlank String prompt) {
}
