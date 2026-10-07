package capstone.capstoneproject.config;

import capstone.capstoneproject.fridge.entity.Compartment;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "ingredient-seed")
public class IngredientSeedProperties {

    // YAML의 재료 목록을 타입 안전하게 바인딩한다.
    @Valid
    private List<IngredientSeed> ingredients = new ArrayList<>();

    public List<IngredientSeed> getIngredients() {
        return ingredients;
    }

    public void setIngredients(List<IngredientSeed> ingredients) {
        this.ingredients = ingredients;
    }

    public static class IngredientSeed {

        // 재료명은 IngredientMaster.name과 중복 기준으로 사용한다.
        @NotBlank
        private String name;

        // 잘못된 칸 이름이 설정되면 애플리케이션 시작을 실패시킨다.
        @NotNull
        private Compartment defaultCompartment;

        private String iconUrl;

        // 추천 유통기한 계산에 사용하는 기본 보관일이다.
        @NotNull
        @Positive
        private Integer defaultShelfLifeDays;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public Compartment getDefaultCompartment() {
            return defaultCompartment;
        }

        public void setDefaultCompartment(Compartment defaultCompartment) {
            this.defaultCompartment = defaultCompartment;
        }

        public String getIconUrl() {
            return iconUrl;
        }

        public void setIconUrl(String iconUrl) {
            this.iconUrl = iconUrl;
        }

        public Integer getDefaultShelfLifeDays() {
            return defaultShelfLifeDays;
        }

        public void setDefaultShelfLifeDays(Integer defaultShelfLifeDays) {
            this.defaultShelfLifeDays = defaultShelfLifeDays;
        }
    }
}
