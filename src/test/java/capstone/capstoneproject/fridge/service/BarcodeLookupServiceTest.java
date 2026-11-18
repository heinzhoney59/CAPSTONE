package capstone.capstoneproject.fridge.service;

import capstone.capstoneproject.fridge.dto.BarcodeLookupResponse;
import capstone.capstoneproject.fridge.entity.BarcodeProduct;
import capstone.capstoneproject.fridge.entity.Compartment;
import capstone.capstoneproject.fridge.entity.IngredientMaster;
import capstone.capstoneproject.fridge.entity.IngredientUnit;
import capstone.capstoneproject.fridge.repository.BarcodeProductRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BarcodeLookupServiceTest {

    @Mock
    private BarcodeProductRepository barcodeProductRepository;

    private BarcodeLookupService service;

    @BeforeEach
    void setUp() {
        service = new BarcodeLookupService(barcodeProductRepository);
    }

    @Test
    void returnsMappedBarcodeData() {
        IngredientMaster carrot = new IngredientMaster("당근", Compartment.VEGETABLE, null, 14);
        BarcodeProduct product = new BarcodeProduct(
                "8801234567890",
                "당근 데리야끼 500g",
                "가공식품",
                carrot
        );
        when(barcodeProductRepository.findByBarcode("8801234567890"))
                .thenReturn(Optional.of(product));

        BarcodeLookupResponse response = service.lookup("8801234567890");

        assertThat(response.barcode()).isEqualTo("8801234567890");
        assertThat(response.ingredientName()).isEqualTo("당근");
        assertThat(response.compartment()).isEqualTo(Compartment.VEGETABLE);
        assertThat(response.suggestedUnit()).isEqualTo(IngredientUnit.PIECE);
        assertThat(response.defaultShelfLifeDays()).isEqualTo(14);
        assertThat(response.manualMappingRequired()).isFalse();
    }

    @Test
    void returnsManualMappingFlagForUnmappedProduct() {
        BarcodeProduct product = new BarcodeProduct(
                "8801234567890",
                "신규 상품",
                "기타가공품",
                null
        );
        when(barcodeProductRepository.findByBarcode("8801234567890"))
                .thenReturn(Optional.of(product));

        BarcodeLookupResponse response = service.lookup("8801234567890");

        assertThat(response.ingredientName()).isNull();
        assertThat(response.manualMappingRequired()).isTrue();
    }

    @Test
    void rejectsInvalidBarcodeFormat() {
        assertThatThrownBy(() -> service.lookup("ABC123"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(exception -> assertThat(((ResponseStatusException) exception).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void rejectsUnknownBarcode() {
        when(barcodeProductRepository.findByBarcode("8800000000000"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.lookup("8800000000000"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(exception -> ((ResponseStatusException) exception).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }
}
