package capstone.capstoneproject.fridge.dto;

import capstone.capstoneproject.fridge.entity.IngredientUnit;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public final class ShoppingDtos {
    private ShoppingDtos() {}

    public record CreateRequest(
            @NotEmpty @Valid List<ItemRequest> items
    ) {}

    public record ItemRequest(
            @NotBlank String ingredientName,
            @NotNull @DecimalMin("0.001") BigDecimal quantity,
            @NotNull IngredientUnit unit
    ) {}

    public record PurchasedRequest(
            @NotNull Boolean purchased
    ) {}

    public record ItemResponse(
            Long id,
            String ingredientName,
            BigDecimal quantity,
            IngredientUnit unit,
            boolean purchased,
            boolean registered
    ) {}

    public record ChecklistResponse(
            Long id,
            String status,
            LocalDateTime createdAt,
            List<ItemResponse> items
    ) {}

    public record RegisterResponse(
            int registeredCount,
            int skippedCount
    ) {}
}
