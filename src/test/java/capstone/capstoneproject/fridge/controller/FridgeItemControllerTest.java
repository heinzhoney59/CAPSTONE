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

    @BeforeEach
    void setUp() {
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();
        mockMvc = MockMvcBuilders.standaloneSetup(new FridgeItemController(fridgeItemService))
                .setValidator(validator)
                .build();
    }

    @Test
    void createsItem() throws Exception {
        when(fridgeItemService.create(eq(1L), any()))
                .thenReturn(response(1L, "당근", Compartment.VEGETABLE));

        mockMvc.perform(post("/api/fridge/items")
                        .header("X-Member-Id", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "ingredientName": "당근",
                                  "quantity": 2,
                                  "unit": "PIECE",
                                  "expiryDate": "2026-10-10"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.ingredientName").value("당근"))
                .andExpect(jsonPath("$.quantity").value(2));

        verify(fridgeItemService).create(eq(1L), any());
    }

    @Test
    void updatesItem() throws Exception {
        when(fridgeItemService.update(eq(1L), eq(1L), any()))
                .thenReturn(response(1L, "당근", Compartment.FRUIT));

        mockMvc.perform(patch("/api/fridge/items/1")
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
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.compartment").value("FRUIT"));

        verify(fridgeItemService).update(eq(1L), eq(1L), any());
    }

    @Test
    void deletesItem() throws Exception {
        mockMvc.perform(delete("/api/fridge/items/1")
                        .header("X-Member-Id", "1"))
                .andExpect(status().isNoContent());

        verify(fridgeItemService).delete(1L, 1L);
    }

    @Test
    void listsItemsWithFilters() throws Exception {
        when(fridgeItemService.findAll(1L, "당", Compartment.VEGETABLE, "name", "desc"))
                .thenReturn(List.of(response(1L, "당근", Compartment.VEGETABLE)));

        mockMvc.perform(get("/api/fridge/items")
                        .header("X-Member-Id", "1")
                        .queryParam("keyword", "당")
                        .queryParam("compartment", "VEGETABLE")
                        .queryParam("sort", "name")
                        .queryParam("direction", "desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].ingredientName").value("당근"));
    }

    @Test
    void rejectsBlankIngredientName() throws Exception {
        mockMvc.perform(post("/api/fridge/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "ingredientName": " ",
                                  "quantity": 2,
                                  "unit": "PIECE",
                                  "expiryDate": "2026-10-10"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rejectsZeroOrNegativeQuantity() throws Exception {
        mockMvc.perform(post("/api/fridge/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "ingredientName": "당근",
                                  "quantity": 0,
                                  "unit": "PIECE",
                                  "expiryDate": "2026-10-10"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rejectsMissingRequiredFields() throws Exception {
        mockMvc.perform(post("/api/fridge/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "ingredientName": "당근"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rejectsMalformedEnumDateAndMemberHeader() throws Exception {
        mockMvc.perform(post("/api/fridge/items")
                        .header("X-Member-Id", "not-a-number")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "ingredientName": "당근",
                                  "quantity": 2,
                                  "unit": "INVALID",
                                  "expiryDate": "not-a-date"
                                }
                                """))
                .andExpect(status().isBadRequest());
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
                0.0
        );
    }
}
