package capstone.capstoneproject.fridge.repository;

import capstone.capstoneproject.fridge.entity.Compartment;
import capstone.capstoneproject.fridge.entity.FridgeItem;
import capstone.capstoneproject.fridge.entity.FridgeItemStatus;
import capstone.capstoneproject.fridge.entity.InputMethod;
import capstone.capstoneproject.fridge.entity.IngredientMaster;
import capstone.capstoneproject.fridge.entity.IngredientUnit;
import capstone.capstoneproject.member.entity.Member;
import capstone.capstoneproject.member.repository.MemberRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class FridgeItemRepositoryTest {

    @Autowired
    private FridgeItemRepository fridgeItemRepository;

    @Autowired
    private IngredientMasterRepository ingredientMasterRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Test
    void findsStoredItemsOnlyForRequestedMember() {
        Member firstMember = memberRepository.save(new Member("one@example.com", "one"));
        Member secondMember = memberRepository.save(new Member("two@example.com", "two"));
        IngredientMaster ingredient = ingredientMasterRepository.save(
                new IngredientMaster("테스트당근", Compartment.VEGETABLE, null, 14)
        );
        LocalDate expiryDate = LocalDate.of(2026, 10, 10);

        fridgeItemRepository.save(new FridgeItem(
                firstMember, ingredient, Compartment.VEGETABLE, BigDecimal.ONE,
                IngredientUnit.PIECE, expiryDate, LocalDate.of(2026, 10, 3), InputMethod.MANUAL
        ));
        FridgeItem discarded = new FridgeItem(
                firstMember, ingredient, Compartment.VEGETABLE, BigDecimal.ONE,
                IngredientUnit.PIECE, expiryDate, LocalDate.of(2026, 10, 3), InputMethod.MANUAL
        );
        discarded.changeStatus(FridgeItemStatus.DISCARDED);
        fridgeItemRepository.save(discarded);
        fridgeItemRepository.save(new FridgeItem(
                secondMember, ingredient, Compartment.VEGETABLE, BigDecimal.ONE,
                IngredientUnit.PIECE, expiryDate, LocalDate.of(2026, 10, 3), InputMethod.MANUAL
        ));

        List<FridgeItem> result =
                fridgeItemRepository.findAllByMemberAndStatus(firstMember, FridgeItemStatus.STORED);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getMember().getId()).isEqualTo(firstMember.getId());
    }

    @Test
    void findsItemOnlyWhenItBelongsToMember() {
        Member owner = memberRepository.save(new Member("owner@example.com", "owner"));
        Member other = memberRepository.save(new Member("other@example.com", "other"));
        IngredientMaster ingredient = ingredientMasterRepository.save(
                new IngredientMaster("테스트우유", Compartment.DAIRY_AND_BEVERAGE, null, 7)
        );
        FridgeItem item = fridgeItemRepository.save(new FridgeItem(
                owner, ingredient, Compartment.DAIRY_AND_BEVERAGE, BigDecimal.ONE,
                IngredientUnit.MILLILITER, LocalDate.of(2026, 10, 10),
                LocalDate.of(2026, 10, 3), InputMethod.MANUAL
        ));

        assertThat(fridgeItemRepository.findByIdAndMember(item.getId(), owner)).isPresent();
        assertThat(fridgeItemRepository.findByIdAndMember(item.getId(), other)).isEmpty();
    }

    @Test
    void discardsOnlyStoredItemsPastExpiryDate() {
        Member member = memberRepository.save(new Member("expiry@example.com", "expiry"));
        IngredientMaster ingredient = ingredientMasterRepository.save(
                new IngredientMaster("테스트만료재료", Compartment.ETC, null, 1)
        );
        LocalDate today = LocalDate.of(2026, 10, 3);

        FridgeItem expired = fridgeItemRepository.save(new FridgeItem(
                member, ingredient, Compartment.ETC, BigDecimal.ONE,
                IngredientUnit.PIECE, today.minusDays(1), today.minusDays(3), InputMethod.MANUAL
        ));
        FridgeItem todayItem = fridgeItemRepository.save(new FridgeItem(
                member, ingredient, Compartment.ETC, BigDecimal.ONE,
                IngredientUnit.PIECE, today, today.minusDays(3), InputMethod.MANUAL
        ));

        int discardedCount = fridgeItemRepository.discardExpiredItems(today);
        fridgeItemRepository.flush();

        assertThat(discardedCount).isEqualTo(1);
        assertThat(fridgeItemRepository.findById(expired.getId()).orElseThrow().getStatus())
                .isEqualTo(FridgeItemStatus.DISCARDED);
        assertThat(fridgeItemRepository.findById(todayItem.getId()).orElseThrow().getStatus())
                .isEqualTo(FridgeItemStatus.STORED);
    }
}
