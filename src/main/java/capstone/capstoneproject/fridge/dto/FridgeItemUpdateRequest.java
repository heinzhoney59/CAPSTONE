package capstone.capstoneproject.fridge.dto;

import capstone.capstoneproject.fridge.entity.Compartment;
import capstone.capstoneproject.fridge.entity.IngredientUnit;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record FridgeItemUpdateRequest(
        @NotBlank String ingredientName,
        // 수정 시에도 칸을 생략하면 변경된 재료의 기본 칸을 사용한다.
        Compartment compartment,
        @NotNull @DecimalMin("0.001") BigDecimal quantity,
        @NotNull IngredientUnit unit,
        @NotNull LocalDate expiryDate
) {
}
