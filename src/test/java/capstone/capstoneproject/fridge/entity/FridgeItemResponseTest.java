package capstone.capstoneproject.fridge.entity;

import capstone.capstoneproject.fridge.dto.FridgeItemResponse;
import capstone.capstoneproject.member.entity.Member;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class FridgeItemResponseTest {

    private final Member member = new Member("test@example.com", "tester");
    private final IngredientMaster ingredient =
            new IngredientMaster("당근", Compartment.VEGETABLE, null, 14);

    @Test
    void calculatesFreshExpiryData() {
        LocalDate today = LocalDate.of(2026, 10, 3);
        FridgeItem item = new FridgeItem(
                member, ingredient, Compartment.VEGETABLE, BigDecimal.valueOf(2),
                IngredientUnit.PIECE, today.plusDays(7), today, InputMethod.MANUAL
        );

        FridgeItemResponse response = FridgeItemResponse.from(item, today);

        assertThat(response.dDay()).isEqualTo(7);
        assertThat(response.expiryStatus()).isEqualTo("FRESH");
        assertThat(response.expiryProgressRate()).isZero();
        assertThat(response.status()).isEqualTo(FridgeItemStatus.STORED);
    }

    @Test
    void calculatesExpiredDataAndCapsProgress() {
        LocalDate today = LocalDate.of(2026, 10, 10);
        FridgeItem item = new FridgeItem(
                member, ingredient, Compartment.VEGETABLE, BigDecimal.ONE,
                IngredientUnit.PIECE, today.minusDays(1), today.minusDays(10), InputMethod.MANUAL
        );

        FridgeItemResponse response = FridgeItemResponse.from(item, today);

        assertThat(response.dDay()).isEqualTo(-1);
        assertThat(response.expiryStatus()).isEqualTo("EXPIRED");
        assertThat(response.expiryProgressRate()).isEqualTo(1.0);
    }

    @Test
    void handlesExpiryStatusBoundaries() {
        LocalDate today = LocalDate.of(2026, 10, 3);

        assertThat(responseFor(today, 0).expiryStatus()).isEqualTo("URGENT");
        assertThat(responseFor(today, 1).expiryStatus()).isEqualTo("URGENT");
        assertThat(responseFor(today, 2).expiryStatus()).isEqualTo("WARNING");
        assertThat(responseFor(today, 3).expiryStatus()).isEqualTo("WARNING");
        assertThat(responseFor(today, 4).expiryStatus()).isEqualTo("FRESH");
    }

    private FridgeItemResponse responseFor(LocalDate today, int daysUntilExpiry) {
        FridgeItem item = new FridgeItem(
                member, ingredient, Compartment.VEGETABLE, BigDecimal.ONE,
                IngredientUnit.PIECE, today.plusDays(daysUntilExpiry), today, InputMethod.MANUAL
        );
        return FridgeItemResponse.from(item, today);
    }
}
