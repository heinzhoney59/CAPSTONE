package capstone.capstoneproject.fridge.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "barcode_product", indexes = {
        @Index(name = "idx_barcode_product_code", columnList = "barcode", unique = true)
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BarcodeProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "barcode_product_id")
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String barcode;

    @Column(name = "product_name", nullable = false, length = 300)
    private String productName;

    @Column(name = "food_type", length = 100)
    private String foodType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id")
    private IngredientMaster ingredient;

    public BarcodeProduct(String barcode, String productName, String foodType, IngredientMaster ingredient) {
        this.barcode = barcode;
        this.productName = productName;
        this.foodType = foodType;
        this.ingredient = ingredient;
    }

    public void updateMapping(String productName, String foodType, IngredientMaster ingredient) {
        this.productName = productName;
        this.foodType = foodType;
        this.ingredient = ingredient;
    }
}
