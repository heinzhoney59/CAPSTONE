package capstone.capstoneproject.fridge.repository;

import capstone.capstoneproject.fridge.entity.IngredientMaster;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IngredientMasterRepository extends JpaRepository<IngredientMaster, Long> {

    Optional<IngredientMaster> findByName(String name);
}
