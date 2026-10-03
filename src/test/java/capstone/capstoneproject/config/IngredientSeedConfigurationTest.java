package capstone.capstoneproject.config;

import capstone.capstoneproject.fridge.repository.IngredientMasterRepository;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class IngredientSeedConfigurationTest {

    @Autowired
    private IngredientSeedProperties ingredientSeedProperties;

    @Autowired
    private IngredientMasterRepository ingredientMasterRepository;

    @Test
    void loadsIngredientsFromYamlAndSeedsThem() {
        assertThat(ingredientSeedProperties.getIngredients()).hasSize(4);

        Set<String> configuredNames = ingredientSeedProperties.getIngredients().stream()
                .map(IngredientSeedProperties.IngredientSeed::getName)
                .collect(Collectors.toSet());
        Set<String> persistedNames = ingredientMasterRepository.findAll().stream()
                .map(ingredient -> ingredient.getName())
                .collect(Collectors.toSet());

        assertThat(persistedNames).containsExactlyInAnyOrderElementsOf(configuredNames);
    }
}
