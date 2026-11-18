package capstone.capstoneproject.fridge.service;

import capstone.capstoneproject.fridge.dto.FridgeItemCreateRequest;
import capstone.capstoneproject.fridge.dto.FridgeItemResponse;
import capstone.capstoneproject.fridge.dto.ShoppingDtos;
import capstone.capstoneproject.fridge.entity.Compartment;
import capstone.capstoneproject.fridge.entity.IngredientMaster;
import capstone.capstoneproject.fridge.entity.IngredientUnit;
import capstone.capstoneproject.fridge.entity.ShoppingChecklist;
import capstone.capstoneproject.fridge.entity.ShoppingChecklistStatus;
import capstone.capstoneproject.fridge.repository.IngredientMasterRepository;
import capstone.capstoneproject.fridge.repository.ShoppingChecklistRepository;
import capstone.capstoneproject.member.entity.Member;
import capstone.capstoneproject.member.repository.MemberRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ShoppingChecklistServiceTest {

    @Mock
    private ShoppingChecklistRepository checklistRepository;

    @Mock
    private IngredientMasterRepository ingredientMasterRepository;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private FridgeItemService fridgeItemService;

    private Member member;
    private IngredientMaster carrot;
    private ShoppingChecklistService service;

    @BeforeEach
    void setUp() {
        member = new Member("shop@example.com", "shopper");
        carrot = new IngredientMaster("당근", Compartment.VEGETABLE, null, 14);
        setId(member, 1L);
        setId(carrot, 10L);
        service = new ShoppingChecklistService(
                checklistRepository,
                ingredientMasterRepository,
                memberRepository,
                fridgeItemService
        );
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
    }

    @Test
    void createsChecklistWithPurchaseQuantity() {
        when(ingredientMasterRepository.findByName("당근")).thenReturn(Optional.of(carrot));
        when(checklistRepository.save(any(ShoppingChecklist.class)))
                .thenAnswer(invocation -> {
                    ShoppingChecklist checklist = invocation.getArgument(0);
                    setId(checklist, 7L);
                    setId(checklist.getItems().get(0), 8L);
                    return checklist;
                });

        ShoppingDtos.ChecklistResponse response = service.create(
                1L,
                new ShoppingDtos.CreateRequest(List.of(
                        new ShoppingDtos.ItemRequest(
                                "당근",
                                BigDecimal.valueOf(3),
                                IngredientUnit.PIECE
                        )
                ))
        );

        assertThat(response.id()).isEqualTo(7L);
        assertThat(response.items()).hasSize(1);
        assertThat(response.items().get(0).ingredientName()).isEqualTo("당근");
        assertThat(response.items().get(0).quantity()).isEqualByComparingTo("3");
    }

    @Test
    void registersPurchasedItemIntoFridgeWithStoredQuantity() {
        ShoppingChecklist checklist = new ShoppingChecklist(member);
        setId(checklist, 7L);
        checklist.addItem(new capstone.capstoneproject.fridge.entity.ShoppingChecklistItem(
                carrot,
                "당근",
                BigDecimal.valueOf(3),
                IngredientUnit.PIECE
        ));
        checklist.getItems().get(0).markPurchased(true);
        setId(checklist.getItems().get(0), 8L);

        when(checklistRepository.findAllByMemberAndStatus(member, ShoppingChecklistStatus.ACTIVE))
                .thenReturn(List.of(checklist));
        when(fridgeItemService.create(any(Long.class), any(FridgeItemCreateRequest.class)))
                .thenReturn(createFridgeResponse());

        ShoppingDtos.RegisterResponse response = service.registerPurchased(1L, 7L);

        assertThat(response.registeredCount()).isEqualTo(1);
        assertThat(response.skippedCount()).isZero();
        verify(fridgeItemService).create(
                1L,
                new FridgeItemCreateRequest(
                        "당근",
                        null,
                        BigDecimal.valueOf(3),
                        IngredientUnit.PIECE,
                        null
                )
        );
    }

    @Test
    void skipsPurchasedItemWithoutMappedIngredient() {
        ShoppingChecklist checklist = new ShoppingChecklist(member);
        setId(checklist, 7L);
        checklist.addItem(new capstone.capstoneproject.fridge.entity.ShoppingChecklistItem(
                null,
                "미확인 재료",
                BigDecimal.ONE,
                IngredientUnit.PIECE
        ));
        checklist.getItems().get(0).markPurchased(true);
        setId(checklist.getItems().get(0), 8L);

        when(checklistRepository.findAllByMemberAndStatus(member, ShoppingChecklistStatus.ACTIVE))
                .thenReturn(List.of(checklist));

        ShoppingDtos.RegisterResponse response = service.registerPurchased(1L, 7L);

        assertThat(response.registeredCount()).isZero();
        assertThat(response.skippedCount()).isEqualTo(1);
    }

    private FridgeItemResponse createFridgeResponse() {
        return new FridgeItemResponse(
                1L,
                "당근",
                null,
                Compartment.VEGETABLE,
                BigDecimal.valueOf(3),
                IngredientUnit.PIECE,
                java.time.LocalDate.now().plusDays(14),
                java.time.LocalDate.now(),
                capstone.capstoneproject.fridge.entity.FridgeItemStatus.STORED,
                14,
                "FRESH",
                "green_state",
                0
        );
    }

    private static void setId(Object entity, Long id) {
        try {
            var field = entity.getClass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, id);
        } catch (ReflectiveOperationException exception) {
            throw new AssertionError(exception);
        }
    }
}
