package capstone.capstoneproject.fridge.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ExpiryDisposalScheduler {

    private final FridgeItemService fridgeItemService;

    public ExpiryDisposalScheduler(FridgeItemService fridgeItemService) {
        this.fridgeItemService = fridgeItemService;
    }

    @Scheduled(cron = "${fridge.expiry-disposal.cron:0 0 0 * * *}")
    public void discardExpiredItems() {
        // 실제 상태 변경은 서비스가 담당해 스케줄러가 도메인 로직을 갖지 않게 한다.
        fridgeItemService.discardExpiredItems();
    }
}
