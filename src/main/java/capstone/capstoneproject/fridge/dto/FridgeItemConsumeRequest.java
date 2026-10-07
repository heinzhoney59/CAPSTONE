package capstone.capstoneproject.fridge.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record FridgeItemConsumeRequest(
        @NotNull @DecimalMin("0.001") BigDecimal quantity
) {
}
