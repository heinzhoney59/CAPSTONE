package capstone.capstoneproject.fridge.service;

import capstone.capstoneproject.fridge.dto.WasteComparisonResponse;
import capstone.capstoneproject.fridge.entity.ConsumptionLog;
import capstone.capstoneproject.fridge.entity.ConsumptionLogType;
import capstone.capstoneproject.fridge.entity.IngredientUnit;
import capstone.capstoneproject.fridge.repository.ConsumptionLogRepository;
import capstone.capstoneproject.member.entity.Member;
import capstone.capstoneproject.member.repository.MemberRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class WasteStatisticsService {

    private final ConsumptionLogRepository consumptionLogRepository;
    private final MemberRepository memberRepository;

    public WasteStatisticsService(
            ConsumptionLogRepository consumptionLogRepository,
            MemberRepository memberRepository
    ) {
        this.consumptionLogRepository = consumptionLogRepository;
        this.memberRepository = memberRepository;
    }

    public WasteComparisonResponse compareWithPreviousWeek(Long memberId, LocalDate referenceDate) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원을 찾을 수 없습니다."));
        LocalDate currentStart = referenceDate.with(DayOfWeek.MONDAY);
        LocalDate previousStart = currentStart.minusWeeks(1);
        Map<IngredientUnit, BigDecimal> current = sumByUnit(
                member, previousStart.plusWeeks(1).atStartOfDay(), currentStart.plusWeeks(1).atStartOfDay()
        );
        Map<IngredientUnit, BigDecimal> previous = sumByUnit(
                member, previousStart.atStartOfDay(), currentStart.atStartOfDay()
        );

        Map<String, WasteComparisonResponse.UnitWaste> result = new LinkedHashMap<>();
        for (IngredientUnit unit : IngredientUnit.values()) {
            BigDecimal currentQuantity = current.getOrDefault(unit, BigDecimal.ZERO);
            BigDecimal previousQuantity = previous.getOrDefault(unit, BigDecimal.ZERO);
            if (currentQuantity.signum() == 0 && previousQuantity.signum() == 0) {
                continue;
            }
            BigDecimal changeRate = previousQuantity.signum() == 0
                    ? null
                    : currentQuantity.subtract(previousQuantity)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(previousQuantity, 2, RoundingMode.HALF_UP);
            result.put(unit.name(), new WasteComparisonResponse.UnitWaste(
                    currentQuantity, previousQuantity, changeRate
            ));
        }
        return new WasteComparisonResponse(
                currentStart.toString(),
                previousStart.toString(),
                result
        );
    }

    private Map<IngredientUnit, BigDecimal> sumByUnit(
            Member member,
            LocalDateTime from,
            LocalDateTime to
    ) {
        Map<IngredientUnit, BigDecimal> totals = new EnumMap<>(IngredientUnit.class);
        for (ConsumptionLog log : consumptionLogRepository.findAllByMemberAndTypeAndPeriod(
                member, ConsumptionLogType.DISCARDED, from, to
        )) {
            totals.merge(log.getUnit(), log.getQuantity(), BigDecimal::add);
        }
        return totals;
    }
}
