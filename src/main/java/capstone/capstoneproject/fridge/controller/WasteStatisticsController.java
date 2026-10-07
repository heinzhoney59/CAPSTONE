package capstone.capstoneproject.fridge.controller;

import capstone.capstoneproject.fridge.dto.WasteComparisonResponse;
import capstone.capstoneproject.fridge.service.WasteStatisticsService;
import java.time.LocalDate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/fridge/waste")
public class WasteStatisticsController {

    private final WasteStatisticsService wasteStatisticsService;

    public WasteStatisticsController(WasteStatisticsService wasteStatisticsService) {
        this.wasteStatisticsService = wasteStatisticsService;
    }

    @GetMapping("/weekly-comparison")
    public WasteComparisonResponse compareWithPreviousWeek(
            @RequestHeader(value = "X-Member-Id", defaultValue = "1") Long memberId,
            @RequestParam(required = false) LocalDate referenceDate
    ) {
        return wasteStatisticsService.compareWithPreviousWeek(
                memberId,
                referenceDate == null ? LocalDate.now() : referenceDate
        );
    }
}
