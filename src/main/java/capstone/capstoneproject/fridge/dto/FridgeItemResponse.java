package capstone.capstoneproject.fridge.dto;

import capstone.capstoneproject.fridge.entity.Compartment;
import capstone.capstoneproject.fridge.entity.FridgeItem;
import capstone.capstoneproject.fridge.entity.FridgeItemStatus;
import capstone.capstoneproject.fridge.entity.IngredientUnit;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public record FridgeItemResponse(
        Long id,
        String ingredientName,
        String iconUrl,
        Compartment compartment,
        BigDecimal quantity,
        IngredientUnit unit,
        LocalDate expiryDate,
        LocalDate registeredAt,
        FridgeItemStatus status,
        long dDay,
        String expiryStatus,
        String state,
        double expiryProgressRate
) {
    public static FridgeItemResponse from(FridgeItem item, LocalDate today) {
        // D-day와 임박도는 클라이언트 시간이 아닌 서버 기준으로 계산한다.
        long dDay = ChronoUnit.DAYS.between(today, item.getExpiryDate());
        long totalDays = Math.max(1, ChronoUnit.DAYS.between(item.getRegisteredAt(), item.getExpiryDate()));
        long elapsedDays = ChronoUnit.DAYS.between(item.getRegisteredAt(), today);
        // 진행률은 0~1 범위를 벗어나지 않도록 제한한다.
        double progress = Math.max(0.0, Math.min(1.0, (double) elapsedDays / totalDays));

        // 만료 당일은 긴급으로 표시하고, 다음 날부터 자동 폐기 대상이다.
        String expiryStatus = dDay < 0 ? "EXPIRED" : dDay <= 1 ? "URGENT" : dDay <= 3 ? "WARNING" : "FRESH";
        String state = dDay >= 30 ? "green_state" : dDay >= 7 ? "orange_state" : "red_state";
        return new FridgeItemResponse(
                item.getId(),
                item.getIngredientMaster().getName(),
                item.getIngredientMaster().getIconUrl(),
                item.getCompartment(),
                item.getQuantity(),
                item.getUnit(),
                item.getExpiryDate(),
                item.getRegisteredAt(),
                item.getStatus(),
                dDay,
                expiryStatus,
                state,
                progress
        );
    }
}
