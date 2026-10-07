package capstone.capstoneproject.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "food-data.import")
public record FoodDataImportProperties(
        boolean enabled,
        String path,
        String charset
) {
}
