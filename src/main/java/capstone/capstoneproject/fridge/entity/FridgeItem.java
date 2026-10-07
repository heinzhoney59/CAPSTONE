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
@Table(name = "fridge_item")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FridgeItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fridge_item_id")
    private Long id;

    // 나중에 인증 회원과 연결할 소유자 관계. 모든 재고 접근의 기준이 된다.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    // 재료명·아이콘·기본 칸을 제공하는 표준 재료 마스터 관계.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id")
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
        this.ingredientMaster = ingredientMaster;
        this.compartment = compartment;
        this.quantity = quantity;
        this.unit = unit;
        this.expiryDate = expiryDate;
    }

    public void changeStatus(FridgeItemStatus status) {
        this.status = status;
    }

    public void consume(BigDecimal consumedQuantity) {
        this.quantity = this.quantity.subtract(consumedQuantity);
        if (this.quantity.signum() == 0) {
            this.status = FridgeItemStatus.CONSUMED;
        }
    }
}
