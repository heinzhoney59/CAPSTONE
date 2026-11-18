package capstone.capstoneproject.config;

import capstone.capstoneproject.fridge.entity.BarcodeProduct;
import capstone.capstoneproject.fridge.entity.IngredientMaster;
import capstone.capstoneproject.fridge.repository.BarcodeProductRepository;
import capstone.capstoneproject.fridge.repository.IngredientMasterRepository;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.zip.GZIPInputStream;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

@Component
public class BarcodeDataImportRunner implements CommandLineRunner {

    private final BarcodeProductRepository barcodeProductRepository;
    private final IngredientMasterRepository ingredientMasterRepository;

    public BarcodeDataImportRunner(
            BarcodeProductRepository barcodeProductRepository,
            IngredientMasterRepository ingredientMasterRepository
    ) {
        this.barcodeProductRepository = barcodeProductRepository;
        this.ingredientMasterRepository = ingredientMasterRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (barcodeProductRepository.count() > 0) {
            return;
        }

        ClassPathResource resource = new ClassPathResource("data/C005.csv.gz");
        if (!resource.exists()) {
            return;
        }
        int created = 0;
        int unmapped = 0;
        Map<String, IngredientMaster> masters = ingredientMasterRepository.findAll().stream()
                .collect(Collectors.toMap(
                        ingredient -> normalize(ingredient.getName()),
                        Function.identity(),
                        (left, right) -> left
                ));

        try (GZIPInputStream gzip = new GZIPInputStream(resource.getInputStream());
             BufferedReader reader = new BufferedReader(new InputStreamReader(gzip, StandardCharsets.UTF_8));
             CSVParser parser = CSVFormat.DEFAULT.builder()
                     .setHeader()
                     .setSkipHeaderRecord(true)
                     .setIgnoreEmptyLines(true)
                     .build()
                     .parse(reader)) {
            for (CSVRecord record : parser) {
                String barcode = trim(record.get("BAR_CD"));
                String productName = trim(record.get("PRDLST_NM"));
                if (barcode.isBlank() || productName.isBlank()) {
                    continue;
                }
                String foodType = trim(record.get("PRDLST_DCNM"));
                IngredientMaster ingredient = findMaster(productName, masters);
                if (ingredient == null) {
                    unmapped++;
                }
                Optional<BarcodeProduct> existing = barcodeProductRepository.findByBarcode(barcode);
                if (existing.isPresent()) {
                    existing.get().updateMapping(productName, foodType, ingredient);
                } else {
                    barcodeProductRepository.save(new BarcodeProduct(barcode, productName, foodType, ingredient));
                    created++;
                }
            }
        }
        System.out.printf("바코드 CSV 적재 완료: created=%d, unmapped=%d%n", created, unmapped);
    }

    private IngredientMaster findMaster(String productName, Map<String, IngredientMaster> masters) {
        IngredientMaster direct = masters.get(normalize(productName));
        if (direct != null) {
            return direct;
        }
        String normalizedProduct = normalize(productName);
        for (Map.Entry<String, IngredientMaster> entry : masters.entrySet()) {
            if (!entry.getKey().isBlank()
                    && (normalizedProduct.startsWith(entry.getKey()) || entry.getKey().startsWith(normalizedProduct))) {
                return entry.getValue();
            }
        }
        return null;
    }

    private String normalize(String value) {
        return value == null ? "" : value.replaceAll("[^가-힣a-zA-Z0-9]", "").toLowerCase();
    }

    private String trim(String value) {
        return value == null ? "" : value.trim();
    }
}
