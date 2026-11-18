package capstone.capstoneproject.fridge.repository;

import capstone.capstoneproject.fridge.entity.BarcodeProduct;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BarcodeProductRepository extends JpaRepository<BarcodeProduct, Long> {
    Optional<BarcodeProduct> findByBarcode(String barcode);
}
