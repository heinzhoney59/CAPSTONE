package capstone.capstoneproject.fridge.dto;

import capstone.capstoneproject.fridge.entity.Compartment;
import capstone.capstoneproject.fridge.entity.IngredientUnit;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record FridgeItemCreateRequest(
        // IngredientMaster에 등록된 이름만 등록할 수 있다.
        @NotBlank String ingredientName,
        // null이면 재료 마스터의 기본 칸을 사용한다.
        Compartment compartment,
        @NotNull @DecimalMin("0.001") BigDecimal quantity,
        @NotNull IngredientUnit unit,
        @NotNull LocalDate expiryDate
) {
}
