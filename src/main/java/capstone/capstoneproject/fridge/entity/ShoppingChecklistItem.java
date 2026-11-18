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
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "shopping_checklist_item")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ShoppingChecklistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "shopping_checklist_item_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "shopping_checklist_id", nullable = false)
    private ShoppingChecklist checklist;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id")
    private IngredientMaster ingredient;

    @Column(name = "ingredient_name", nullable = false, length = 100)
    private String ingredientName;

    @Column(nullable = false, precision = 12, scale = 3)
    private BigDecimal quantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private IngredientUnit unit;

    @Column(nullable = false)
    private boolean purchased;

    @Column(nullable = false)
    private boolean registered;

    public ShoppingChecklistItem(
            IngredientMaster ingredient,
            String ingredientName,
            BigDecimal quantity,
            IngredientUnit unit
    ) {
        this.ingredient = ingredient;
        this.ingredientName = ingredientName;
        this.quantity = quantity;
        this.unit = unit;
    }

    void setChecklist(ShoppingChecklist checklist) {
        this.checklist = checklist;
    }

    public void markPurchased(boolean purchased) {
        this.purchased = purchased;
    }

    public void markRegistered() {
        this.registered = true;
    }
}
