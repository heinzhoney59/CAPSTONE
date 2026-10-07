package capstone.capstoneproject.fridge.dto;

import java.math.BigDecimal;
import java.util.Map;

public record WasteComparisonResponse(
        String currentWeekStart,
        String previousWeekStart,
        Map<String, UnitWaste> byUnit
) {
    public record UnitWaste(
            BigDecimal currentWeekQuantity,
            BigDecimal previousWeekQuantity,
            BigDecimal changeRatePercent
    ) {
    }
}
