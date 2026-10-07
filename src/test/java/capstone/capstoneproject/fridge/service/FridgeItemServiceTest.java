package capstone.capstoneproject.fridge.service;

import capstone.capstoneproject.fridge.dto.FridgeItemCreateRequest;
import capstone.capstoneproject.fridge.dto.FridgeItemConsumeRequest;
import capstone.capstoneproject.fridge.dto.FridgeItemResponse;
import capstone.capstoneproject.fridge.dto.FridgeItemUpdateRequest;
import capstone.capstoneproject.fridge.entity.Compartment;
import capstone.capstoneproject.fridge.entity.FridgeItem;
import capstone.capstoneproject.fridge.entity.InputMethod;
import capstone.capstoneproject.fridge.entity.IngredientMaster;
import capstone.capstoneproject.fridge.entity.IngredientUnit;
import capstone.capstoneproject.fridge.entity.FridgeItemStatus;
import capstone.capstoneproject.fridge.repository.FridgeItemRepository;
import capstone.capstoneproject.fridge.repository.ConsumptionLogRepository;
import capstone.capstoneproject.fridge.repository.IngredientMasterRepository;
import capstone.capstoneproject.member.entity.Member;
import capstone.capstoneproject.member.repository.MemberRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FridgeItemServiceTest {

    @Mock
    private FridgeItemRepository fridgeItemRepository;

    @Mock
    private IngredientMasterRepository ingredientMasterRepository;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private ConsumptionLogRepository consumptionLogRepository;

    private Member member;
    private IngredientMaster carrot;
    private FridgeItemService service;

    @BeforeEach
    void setUp() {
        member = new Member("test@example.com", "tester");
        carrot = new IngredientMaster("당근", Compartment.VEGETABLE, null, 14);
        service = new FridgeItemService(
                fridgeItemRepository,
                ingredientMasterRepository,
                memberRepository,
                consumptionLogRepository
        );
        lenient().when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
        lenient().when(ingredientMasterRepository.findByName("당근")).thenReturn(Optional.of(carrot));
    }

    @Test
    void createsItemWithIngredientDefaultCompartment() {
        when(fridgeItemRepository.save(any(FridgeItem.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        FridgeItemResponse response = service.create(
                1L,
                new FridgeItemCreateRequest(
                        "당근", null, BigDecimal.valueOf(2), IngredientUnit.PIECE,
                        LocalDate.now().plusDays(7)
                )
        );

        assertThat(response.ingredientName()).isEqualTo("당근");
        assertThat(response.compartment()).isEqualTo(Compartment.VEGETABLE);
        assertThat(response.quantity()).isEqualByComparingTo("2");
        verify(fridgeItemRepository).save(any(FridgeItem.class));
    }

    @Test
    void rejectsUnknownMember() {
        when(memberRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(
                99L,
                new FridgeItemCreateRequest(
                        "당근", null, BigDecimal.ONE, IngredientUnit.PIECE,
                        LocalDate.now().plusDays(1)
                )
        )).isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("회원을 찾을 수 없습니다");
    }

    @Test
    void rejectsUnknownIngredient() {
        when(ingredientMasterRepository.findByName("없는 재료")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(
                1L,
                new FridgeItemCreateRequest(
                        "없는 재료", null, BigDecimal.ONE, IngredientUnit.PIECE,
                        LocalDate.now().plusDays(1)
                )
        )).isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("등록된 재료 마스터가 없습니다");
    }

    @Test
    void updatesItem() {
        FridgeItem item = new FridgeItem(
                member, carrot, Compartment.VEGETABLE, BigDecimal.ONE, IngredientUnit.PIECE,
                LocalDate.now().plusDays(3), LocalDate.now(), InputMethod.MANUAL
        );
        when(fridgeItemRepository.findByIdAndMember(1L, member)).thenReturn(Optional.of(item));
        when(ingredientMasterRepository.findByName("당근")).thenReturn(Optional.of(carrot));

        FridgeItemResponse response = service.update(
                1L,
                1L,
                new FridgeItemUpdateRequest(
                        "당근", Compartment.FRUIT, BigDecimal.valueOf(4), IngredientUnit.GRAM,
                        LocalDate.now().plusDays(10)
                )
        );

        assertThat(response.compartment()).isEqualTo(Compartment.FRUIT);
        assertThat(response.quantity()).isEqualByComparingTo("4");
        assertThat(response.unit()).isEqualTo(IngredientUnit.GRAM);
    }

    @Test
    void deletesOwnedItem() {
        FridgeItem item = new FridgeItem(
                member, carrot, Compartment.VEGETABLE, BigDecimal.ONE, IngredientUnit.PIECE,
                LocalDate.now().plusDays(3), LocalDate.now(), InputMethod.MANUAL
        );
        when(fridgeItemRepository.findByIdAndMember(1L, member)).thenReturn(Optional.of(item));

        service.delete(1L, 1L);

        verify(fridgeItemRepository).delete(item);
    }

    @Test
    void filtersAndSortsStoredItems() {
        FridgeItem later = new FridgeItem(
                member, carrot, Compartment.VEGETABLE, BigDecimal.ONE, IngredientUnit.PIECE,
                LocalDate.now().plusDays(10), LocalDate.now(), InputMethod.MANUAL
        );
        when(fridgeItemRepository.findAllByMemberAndStatus(any(), any()))
                .thenReturn(List.of(later));

        List<FridgeItemResponse> result =
                service.findAll(1L, "당근", Compartment.VEGETABLE, "expiryDate", "asc");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).ingredientName()).isEqualTo("당근");
    }

    @Test
    void discardsItemsPastExpiryDate() {
        FridgeItem first = new FridgeItem(
                member, carrot, Compartment.VEGETABLE, BigDecimal.ONE, IngredientUnit.PIECE,
                LocalDate.now().minusDays(1), LocalDate.now().minusDays(7), InputMethod.MANUAL
        );
        FridgeItem second = new FridgeItem(
                member, carrot, Compartment.VEGETABLE, BigDecimal.valueOf(2), IngredientUnit.PIECE,
                LocalDate.now().minusDays(2), LocalDate.now().minusDays(8), InputMethod.MANUAL
        );
        when(fridgeItemRepository.findAllByStatus(FridgeItemStatus.STORED))
                .thenReturn(List.of(first, second));

        int discardedCount = service.discardExpiredItems();

        assertThat(discardedCount).isEqualTo(2);
        verify(consumptionLogRepository, org.mockito.Mockito.times(2))
                .save(any(capstone.capstoneproject.fridge.entity.ConsumptionLog.class));
    }

    @Test
    void consumesPartOfStoredItemAndWritesLog() {
        FridgeItem item = new FridgeItem(
                member, carrot, Compartment.VEGETABLE, BigDecimal.valueOf(3), IngredientUnit.PIECE,
                LocalDate.now().plusDays(3), LocalDate.now(), InputMethod.MANUAL
        );
        when(fridgeItemRepository.findByIdAndMember(1L, member)).thenReturn(Optional.of(item));

        FridgeItemResponse response = service.consume(
                1L, 1L, new FridgeItemConsumeRequest(BigDecimal.ONE)
        );

        assertThat(response.quantity()).isEqualByComparingTo("2");
        assertThat(response.status()).isEqualTo(FridgeItemStatus.STORED);
        verify(consumptionLogRepository).save(any(capstone.capstoneproject.fridge.entity.ConsumptionLog.class));
    }

    @Test
    void rejectsConsumeQuantityGreaterThanStoredQuantity() {
        FridgeItem item = new FridgeItem(
                member, carrot, Compartment.VEGETABLE, BigDecimal.ONE, IngredientUnit.PIECE,
                LocalDate.now().plusDays(3), LocalDate.now(), InputMethod.MANUAL
        );
        when(fridgeItemRepository.findByIdAndMember(1L, member)).thenReturn(Optional.of(item));

        assertThatThrownBy(() -> service.consume(
                1L, 1L, new FridgeItemConsumeRequest(BigDecimal.valueOf(2))
        ))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(exception -> assertThat(((ResponseStatusException) exception).getStatusCode())
                        .isEqualTo(org.springframework.http.HttpStatus.BAD_REQUEST));
    }
}
