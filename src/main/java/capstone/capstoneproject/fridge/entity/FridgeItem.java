package capstone.capstoneproject.fridge.entity;

import capstone.capstoneproject.member.entity.Member;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "fridge_item",
        indexes = {
                @jakarta.persistence.Index(
                        name = "idx_fridge_item_member_status",
                        columnList = "member_id,status"
                ),
                @jakarta.persistence.Index(
                        name = "idx_fridge_item_member_expiry",
                        columnList = "member_id,expiry_date"
                )
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FridgeItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fridge_item_id")
    private Long id;

    // 모든 재고 접근은 소유 회원을 기준으로 제한한다.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    // 재료명·아이콘·기본 칸·알레르기 기준을 제공하는 표준 재료 마스터 관계.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private IngredientMaster ingredientMaster;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Compartment compartment;

    @Column(nullable = false, precision = 12, scale = 3)
    private BigDecimal quantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private IngredientUnit unit;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "registered_at", nullable = false)
    private LocalDate registeredAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "input_method", nullable = false, length = 20)
    private InputMethod inputMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FridgeItemStatus status;

    public FridgeItem(
            Member member,
            IngredientMaster ingredientMaster,
            Compartment compartment,
            BigDecimal quantity,
            IngredientUnit unit,
            LocalDate expiryDate,
            LocalDate registeredAt,
            InputMethod inputMethod
    ) {
        validateQuantity(quantity);
        this.member = member;
        this.ingredientMaster = ingredientMaster;
        this.compartment = compartment;
        this.quantity = quantity;
        this.unit = unit;
        this.expiryDate = expiryDate;
        this.registeredAt = registeredAt;
        this.inputMethod = inputMethod;
        this.status = FridgeItemStatus.STORED;
    }

    public void update(
            IngredientMaster ingredientMaster,
            Compartment compartment,
            BigDecimal quantity,
            IngredientUnit unit,
            LocalDate expiryDate
    ) {
        validateQuantity(quantity);
        this.ingredientMaster = ingredientMaster;
        this.compartment = compartment;
        this.quantity = quantity;
        this.unit = unit;
        this.expiryDate = expiryDate;
    }

    public void changeStatus(FridgeItemStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("재료 상태는 null일 수 없습니다.");
        }
        this.status = status;
    }

    public void consume(BigDecimal consumedQuantity) {
        validateQuantity(consumedQuantity);
        if (consumedQuantity.compareTo(quantity) > 0) {
            throw new IllegalArgumentException("소진 수량이 현재 수량보다 많습니다.");
        }
        this.quantity = this.quantity.subtract(consumedQuantity);
        if (this.quantity.signum() == 0) {
            this.status = FridgeItemStatus.CONSUMED;
        }
    }

    private void validateQuantity(BigDecimal quantity) {
        if (quantity == null || quantity.signum() <= 0) {
            throw new IllegalArgumentException("재료 수량은 0보다 커야 합니다.");
        }
    }
}
