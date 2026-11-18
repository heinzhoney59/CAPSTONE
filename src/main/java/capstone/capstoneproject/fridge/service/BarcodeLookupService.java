package capstone.capstoneproject.fridge.service;

import capstone.capstoneproject.fridge.dto.BarcodeLookupResponse;
import capstone.capstoneproject.fridge.entity.BarcodeProduct;
import capstone.capstoneproject.fridge.entity.IngredientUnit;
import capstone.capstoneproject.fridge.repository.BarcodeProductRepository;
import java.math.BigDecimal;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class BarcodeLookupService {

    private final BarcodeProductRepository barcodeProductRepository;

    public BarcodeLookupService(BarcodeProductRepository barcodeProductRepository) {
        this.barcodeProductRepository = barcodeProductRepository;
    }

    public BarcodeLookupResponse lookup(String barcode) {
        String normalized = barcode == null ? "" : barcode.trim();
        if (!normalized.matches("\\d{8,14}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "유효한 바코드 번호를 입력해 주세요.");
        }
        BarcodeProduct product = barcodeProductRepository.findByBarcode(normalized)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "등록되지 않은 바코드입니다. 표준 재료를 직접 선택해 주세요."
                ));

        boolean requiresManualMapping = product.getIngredient() == null;
        return new BarcodeLookupResponse(
                product.getBarcode(),
                product.getProductName(),
                product.getFoodType(),
                requiresManualMapping ? null : product.getIngredient().getName(),
                requiresManualMapping ? null : product.getIngredient().getDefaultCompartment(),
                IngredientUnit.PIECE,
                BigDecimal.ONE,
                requiresManualMapping ? null : product.getIngredient().getDefaultShelfLifeDays(),
                requiresManualMapping
        );
    }
}
