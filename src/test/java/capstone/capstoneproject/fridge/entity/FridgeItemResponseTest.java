package capstone.capstoneproject.fridge.entity;

import capstone.capstoneproject.fridge.dto.FridgeItemResponse;
import capstone.capstoneproject.member.entity.Member;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

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
        assertThat(response.state()).isEqualTo("orange_state");
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
        assertThat(response.state()).isEqualTo("red_state");
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

    @Test
    void handlesThreeLevelStateBoundaries() {
        LocalDate today = LocalDate.of(2026, 10, 3);

        assertThat(responseFor(today, 30).state()).isEqualTo("green_state");
        assertThat(responseFor(today, 29).state()).isEqualTo("orange_state");
        assertThat(responseFor(today, 7).state()).isEqualTo("orange_state");
        assertThat(responseFor(today, 6).state()).isEqualTo("red_state");
        assertThat(responseFor(today, 0).state()).isEqualTo("red_state");
        assertThat(responseFor(today, -1).state()).isEqualTo("red_state");
    }

    @Test
    void rejectsInvalidConsumptionAtEntityBoundary() {
        LocalDate today = LocalDate.of(2026, 10, 3);
        FridgeItem item = new FridgeItem(
                member, ingredient, Compartment.VEGETABLE, BigDecimal.ONE,
                IngredientUnit.PIECE, today.plusDays(7), today, InputMethod.MANUAL
        );

        assertThatThrownBy(() -> item.consume(BigDecimal.ZERO))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("재료 수량은 0보다 커야 합니다.");
        assertThatThrownBy(() -> item.consume(BigDecimal.valueOf(2)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("소진 수량이 현재 수량보다 많습니다.");
        assertThat(item.getQuantity()).isEqualByComparingTo("1");
        assertThat(item.getStatus()).isEqualTo(FridgeItemStatus.STORED);
    }

    private FridgeItemResponse responseFor(LocalDate today, int daysUntilExpiry) {
        FridgeItem item = new FridgeItem(
                member, ingredient, Compartment.VEGETABLE, BigDecimal.ONE,
                IngredientUnit.PIECE, today.plusDays(daysUntilExpiry), today, InputMethod.MANUAL
        );
        return FridgeItemResponse.from(item, today);
    }
}
