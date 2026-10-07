package capstone.capstoneproject.fridge.repository;

import capstone.capstoneproject.fridge.entity.FridgeItem;
import capstone.capstoneproject.fridge.entity.FridgeItemStatus;
import capstone.capstoneproject.member.entity.Member;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;

public interface FridgeItemRepository extends JpaRepository<FridgeItem, Long> {

    List<FridgeItem> findAllByMemberAndStatus(Member member, FridgeItemStatus status);

    List<FridgeItem> findAllByStatus(FridgeItemStatus status);

    java.util.Optional<FridgeItem> findByIdAndMember(Long id, Member member);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            /* 보관 중이고 유통기한이 지난 재료만 자동 폐기한다. */
            update FridgeItem item
               set item.status = capstone.capstoneproject.fridge.entity.FridgeItemStatus.DISCARDED
             where item.status = capstone.capstoneproject.fridge.entity.FridgeItemStatus.STORED
               and item.expiryDate < :today
            """)
    int discardExpiredItems(@Param("today") LocalDate today);
}
