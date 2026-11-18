package capstone.capstoneproject.ai.dto;

import java.util.List;

public record GeminiGenerateContentRequest(List<Content> contents) {

    public record Content(List<Part> parts) {
    }

    public record Part(String text, InlineData inlineData) {
        public Part(String text) {
            this(text, null);
        }

        public Part(InlineData inlineData) {
            this(null, inlineData);
        }

        public record InlineData(String mimeType, String data) {
        }
    }
}
