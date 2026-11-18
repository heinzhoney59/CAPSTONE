package capstone.capstoneproject.ocr;

import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class OcrControllerTest {

    @Mock
    private OcrProvider ocrProvider;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new OcrController(ocrProvider)).build();
    }

    @Test
    void extractsIngredientsFromImage() throws Exception {
        when(ocrProvider.extract(any(byte[].class), eq("image/jpeg")))
                .thenReturn(List.of(new OcrIngredientCandidate(
                        "콩나물",
                        BigDecimal.valueOf(500),
                        "GRAM"
                )));

        MockMultipartFile image = new MockMultipartFile(
                "image",
                "receipt.jpg",
                "image/jpeg",
                new byte[]{1, 2, 3}
        );

        mockMvc.perform(multipart("/api/ocr").file(image))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].ingredientName").value("콩나물"))
                .andExpect(jsonPath("$[0].quantity").value(500))
                .andExpect(jsonPath("$[0].unit").value("GRAM"));

        verify(ocrProvider).extract(any(byte[].class), eq("image/jpeg"));
    }

    @Test
    void rejectsEmptyImage() throws Exception {
        MockMultipartFile image = new MockMultipartFile(
                "image",
                "empty.jpg",
                "image/jpeg",
                new byte[0]
        );

        mockMvc.perform(multipart("/api/ocr").file(image))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rejectsNonImageFile() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "image",
                "document.txt",
                "text/plain",
                "not an image".getBytes()
        );

        mockMvc.perform(multipart("/api/ocr").file(file))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rejectsImageOverTenMegabytes() throws Exception {
        MockMultipartFile image = new MockMultipartFile(
                "image",
                "large.jpg",
                "image/jpeg",
                new byte[10 * 1024 * 1024 + 1]
        );

        mockMvc.perform(multipart("/api/ocr").file(image))
                .andExpect(status().isPayloadTooLarge());
    }
}
