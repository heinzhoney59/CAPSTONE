package capstone.capstoneproject.fridge.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ingredient_master")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class IngredientMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ingredient_id")
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "default_compartment", nullable = false, length = 30)
    private Compartment defaultCompartment;

    @Column(name = "icon_url", length = 500)
    private String iconUrl;

    @Column(name = "default_shelf_life_days")
    private Integer defaultShelfLifeDays;

    public IngredientMaster(
            String name,
            Compartment defaultCompartment,
            String iconUrl,
            Integer defaultShelfLifeDays
    ) {
        this.name = name;
        this.defaultCompartment = defaultCompartment;
        this.iconUrl = iconUrl;
        this.defaultShelfLifeDays = defaultShelfLifeDays;
    }
}
