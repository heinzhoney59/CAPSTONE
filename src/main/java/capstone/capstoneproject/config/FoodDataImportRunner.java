package capstone.capstoneproject.config;

import capstone.capstoneproject.fridge.entity.Compartment;
import capstone.capstoneproject.fridge.entity.IngredientMaster;
import capstone.capstoneproject.fridge.repository.IngredientMasterRepository;
import java.io.BufferedReader;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class FoodDataImportRunner implements CommandLineRunner {

    private final FoodDataImportProperties properties;
    private final IngredientMasterRepository ingredientMasterRepository;

    public FoodDataImportRunner(
            FoodDataImportProperties properties,
            IngredientMasterRepository ingredientMasterRepository
    ) {
        this.properties = properties;
        this.ingredientMasterRepository = ingredientMasterRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (!properties.enabled()) {
            return;
        }
        if (properties.path() == null || properties.path().isBlank()) {
            throw new IllegalStateException("food-data.import.path가 설정되지 않았습니다.");
        }
        ImportResult result = importFile(Path.of(properties.path()));
        System.out.printf(
                "식품 CSV 적재 완료: created=%d, skipped=%d, invalid=%d%n",
                result.created(), result.skipped(), result.invalid()
        );
    }

    ImportResult importFile(Path path) throws IOException {
        Charset charset = Charset.forName(
                properties.charset() == null || properties.charset().isBlank()
                        ? StandardCharsets.UTF_8.name()
                        : properties.charset()
        );
        int created = 0;
        int skipped = 0;
        int invalid = 0;
        try (BufferedReader reader = Files.newBufferedReader(path, charset);
             CSVParser parser = CSVFormat.DEFAULT.builder()
                     .setHeader()
                     .setSkipHeaderRecord(true)
                     .setIgnoreEmptyLines(true)
                     .build()
                     .parse(reader)) {
            for (CSVRecord record : parser) {
                String name = findName(record);
                if (name == null || name.isBlank()) {
                    invalid++;
                    continue;
                }
                if (ingredientMasterRepository.findByName(name).isPresent()) {
                    skipped++;
                    continue;
                }
                ingredientMasterRepository.save(new IngredientMaster(
                        name.trim(),
                        Compartment.ETC,
                        null,
                        null
                ));
                created++;
            }
        }
        return new ImportResult(created, skipped, invalid);
    }

    private String findName(CSVRecord record) {
        for (String header : record.getParser().getHeaderNames()) {
            String normalized = header.replace("\uFEFF", "").trim();
            if (normalized.equals("식품명")
                    || normalized.equals("식품이름")
                    || normalized.equalsIgnoreCase("food_name")
                    || normalized.equalsIgnoreCase("name")) {
                return record.get(header);
            }
        }
        return record.size() > 1 ? record.get(1) : record.get(0);
    }

    record ImportResult(int created, int skipped, int invalid) {
    }
}
