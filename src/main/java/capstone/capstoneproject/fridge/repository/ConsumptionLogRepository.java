package capstone.capstoneproject.fridge.repository;

import capstone.capstoneproject.fridge.entity.ConsumptionLog;
import capstone.capstoneproject.fridge.entity.ConsumptionLogType;
import capstone.capstoneproject.fridge.entity.IngredientUnit;
import capstone.capstoneproject.member.entity.Member;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ConsumptionLogRepository extends JpaRepository<ConsumptionLog, Long> {

    @Query("""
            select log
              from ConsumptionLog log
              join fetch log.fridgeItem item
             where item.member = :member
               and log.logType = :logType
               and log.consumedAt >= :from
               and log.consumedAt < :to
            """)
    List<ConsumptionLog> findAllByMemberAndTypeAndPeriod(
            @Param("member") Member member,
            @Param("logType") ConsumptionLogType logType,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );
}
