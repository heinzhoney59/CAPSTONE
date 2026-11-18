package capstone.capstoneproject.fridge.dto;

import capstone.capstoneproject.fridge.entity.Compartment;
import capstone.capstoneproject.fridge.entity.IngredientUnit;
import java.math.BigDecimal;

public record BarcodeLookupResponse(
        String barcode,
        String productName,
        String foodType,
        String ingredientName,
        Compartment compartment,
        IngredientUnit suggestedUnit,
        BigDecimal suggestedQuantity,
        Integer defaultShelfLifeDays,
        boolean manualMappingRequired
) {
}
