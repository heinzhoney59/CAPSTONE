package capstone.capstoneproject.fridge.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ExpiryDisposalSchedulerTest {

    @Mock
    private FridgeItemService fridgeItemService;

    @Test
    void delegatesScheduledDisposalToService() {
        ExpiryDisposalScheduler scheduler = new ExpiryDisposalScheduler(fridgeItemService);

        scheduler.discardExpiredItems();

        verify(fridgeItemService).discardExpiredItems();
    }
}
