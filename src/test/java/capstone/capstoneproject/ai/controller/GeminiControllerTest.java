package capstone.capstoneproject.ai.controller;

import capstone.capstoneproject.ai.dto.GeminiChatResponse;
import capstone.capstoneproject.ai.service.GeminiService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.RequestBuilder;
import org.springframework.test.web.servlet.ResultMatcher;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class GeminiControllerTest {

    @Mock
    private GeminiService geminiService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new GeminiController(geminiService)).build();
    }

    @Test
    void returnsGeminiAnswer() {
        when(geminiService.chat(eq("냉장고 재료로 만들 수 있는 요리를 추천해줘")))
                .thenReturn(new GeminiChatResponse("gemini-2.5-flash", "김치볶음밥을 추천합니다."));

        perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"prompt":"냉장고 재료로 만들 수 있는 요리를 추천해줘"}
                                """),
                status().isOk(),
                jsonPath("$.model").value("gemini-2.5-flash"),
                jsonPath("$.answer").value("김치볶음밥을 추천합니다."));

        verify(geminiService).chat("냉장고 재료로 만들 수 있는 요리를 추천해줘");
    }

    @Test
    void rejectsBlankPrompt() {
        perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"prompt":" "}
                                """),
                status().isBadRequest());
    }

    private void perform(RequestBuilder request, ResultMatcher... matchers) {
        try {
            var result = mockMvc.perform(request);
            for (ResultMatcher matcher : matchers) {
                result.andExpect(matcher);
            }
        } catch (Exception exception) {
            throw new AssertionError("MockMvc 요청 실행에 실패했습니다.", exception);
        }
    }
}
