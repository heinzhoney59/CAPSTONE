package capstone.capstoneproject.fridge.entity;

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
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "consumption_log")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ConsumptionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "consumption_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fridge_item_id", nullable = false)
    private FridgeItem fridgeItem;

    @Column(name = "meal_log_id")
    private Long mealLogId;

    @Enumerated(EnumType.STRING)
    @Column(name = "log_type", nullable = false, length = 20)
    private ConsumptionLogType logType;

    @Column(nullable = false, precision = 12, scale = 3)
    private BigDecimal quantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private IngredientUnit unit;

    @Column(name = "consumed_at", nullable = false)
    private LocalDateTime consumedAt;

    public ConsumptionLog(
            FridgeItem fridgeItem,
            Long mealLogId,
            ConsumptionLogType logType,
            BigDecimal quantity,
            IngredientUnit unit,
            LocalDateTime consumedAt
    ) {
        this.fridgeItem = fridgeItem;
        this.mealLogId = mealLogId;
        this.logType = logType;
        this.quantity = quantity;
        this.unit = unit;
        this.consumedAt = consumedAt;
    }
}
