package capstone.capstoneproject.fridge.repository;

import capstone.capstoneproject.fridge.entity.ShoppingChecklist;
import capstone.capstoneproject.fridge.entity.ShoppingChecklistStatus;
import capstone.capstoneproject.member.entity.Member;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShoppingChecklistRepository extends JpaRepository<ShoppingChecklist, Long> {
    List<ShoppingChecklist> findAllByMemberAndStatus(Member member, ShoppingChecklistStatus status);
}
