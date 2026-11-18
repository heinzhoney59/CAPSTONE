package capstone.capstoneproject.ocr;

import java.math.BigDecimal;

public record OcrIngredientCandidate(
        String ingredientName,
        BigDecimal quantity,
        String unit
) {
}
