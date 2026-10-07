package capstone.capstoneproject.fridge.controller;

import capstone.capstoneproject.fridge.dto.FridgeItemResponse;
import capstone.capstoneproject.fridge.entity.Compartment;
import capstone.capstoneproject.fridge.entity.FridgeItemStatus;
import capstone.capstoneproject.fridge.entity.IngredientUnit;
import capstone.capstoneproject.fridge.service.FridgeItemService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
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
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class FridgeItemControllerTest {

    @Mock
    private FridgeItemService fridgeItemService;

    private MockMvc mockMvc;

    @BeforeEach//각 테스트 전에 한번씩 실해 하는 파일
    void setUp() {
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();
        mockMvc = MockMvcBuilders.standaloneSetup(new FridgeItemController(fridgeItemService))
                .setValidator(validator)
                .build();
    }

    @Test// 당근이라는 재료를 데이터베이스 생성하고 확인까지
    void createsItem() {
        when(fridgeItemService.create(eq(1L), any()))
                .thenReturn(response(1L, "당근", Compartment.VEGETABLE));

        perform(post("/api/fridge/items")
                        .header("X-Member-Id", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "ingredientName": "당근",
                                  "quantity": 2,
                                  "unit": "PIECE",
                                  "expiryDate": "2026-10-10"
                                }
                                """),
                status().isCreated(),
                jsonPath("$.ingredientName").value("당근"),
                jsonPath("$.quantity").value(2));

        verify(fridgeItemService).create(eq(1L), any());
    }

    @Test
    void updatesItem() {
        when(fridgeItemService.update(eq(1L), eq(1L), any()))
                .thenReturn(response(1L, "당근", Compartment.FRUIT));

        perform(patch("/api/fridge/items/1")
                        .header("X-Member-Id", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "ingredientName": "당근",
                                  "compartment": "FRUIT",
                                  "quantity": 4,
                                  "unit": "GRAM",
                                  "expiryDate": "2026-10-13"
                                }
                                """),
                status().isOk(),
                jsonPath("$.compartment").value("FRUIT"));

        verify(fridgeItemService).update(eq(1L), eq(1L), any());
    }

    @Test
    void deletesItem() {
        perform(delete("/api/fridge/items/1")
                        .header("X-Member-Id", "1"),
                status().isNoContent());

        verify(fridgeItemService).delete(1L, 1L);
    }

    @Test
    void listsItemsWithFilters() {
        when(fridgeItemService.findAll(1L, "당", Compartment.VEGETABLE, "name", "desc"))
                .thenReturn(List.of(response(1L, "당근", Compartment.VEGETABLE)));

        perform(get("/api/fridge/items")
                        .header("X-Member-Id", "1")
                        .queryParam("keyword", "당")
                        .queryParam("compartment", "VEGETABLE")
                        .queryParam("sort", "name")
                        .queryParam("direction", "desc"),
                status().isOk(),
                jsonPath("$[0].ingredientName").value("당근"));
    }

    @Test
    void rejectsBlankIngredientName() {
        perform(post("/api/fridge/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "ingredientName": " ",
                                  "quantity": 2,
                                  "unit": "PIECE",
                                  "expiryDate": "2026-10-10"
                                }
                                """),
                status().isBadRequest());
    }

    @Test
    void rejectsZeroOrNegativeQuantity() {
        perform(post("/api/fridge/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "ingredientName": "당근",
                                  "quantity": 0,
                                  "unit": "PIECE",
                                  "expiryDate": "2026-10-10"
                                }
                                """),
                status().isBadRequest());
    }

    @Test
    void rejectsMissingRequiredFields() {
        perform(post("/api/fridge/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "ingredientName": "당근"
                                }
                                """),
                status().isBadRequest());
    }

    @Test
    void rejectsMalformedEnumDateAndMemberHeader() {
        perform(post("/api/fridge/items")
                        .header("X-Member-Id", "not-a-number")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "ingredientName": "당근",
                                  "quantity": 2,
                                  "unit": "INVALID",
                                  "expiryDate": "not-a-date"
                                }
                                """),
                status().isBadRequest());
    }

    @Test
    void consumesItemWithValidQuantity() {
        when(fridgeItemService.consume(eq(1L), eq(1L), any()))
                .thenReturn(response(1L, "당근", Compartment.VEGETABLE));

        perform(post("/api/fridge/items/1/consume")
                        .header("X-Member-Id", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"quantity":1}
                                """),
                status().isOk(),
                jsonPath("$.status").value("STORED"));

        verify(fridgeItemService).consume(eq(1L), eq(1L), any());
    }

    @Test
    void rejectsConsumeWithoutQuantity() {
        perform(post("/api/fridge/items/1/consume")
                        .header("X-Member-Id", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"),
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

    private FridgeItemResponse response(Long id, String name, Compartment compartment) {
        return new FridgeItemResponse(
                id,
                name,
                null,
                compartment,
                BigDecimal.valueOf(2),
                IngredientUnit.PIECE,
                LocalDate.of(2026, 10, 10),
                LocalDate.of(2026, 10, 3),
                FridgeItemStatus.STORED,
                7,
                "FRESH",
                "orange_state",
                0.0
        );
    }
}
