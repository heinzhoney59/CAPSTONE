package capstone.capstoneproject.fridge.service;

import capstone.capstoneproject.fridge.dto.FridgeItemCreateRequest;
import capstone.capstoneproject.fridge.dto.FridgeItemResponse;
import capstone.capstoneproject.fridge.dto.FridgeItemUpdateRequest;
import capstone.capstoneproject.fridge.entity.Compartment;
import capstone.capstoneproject.fridge.entity.FridgeItem;
import capstone.capstoneproject.fridge.entity.FridgeItemStatus;
import capstone.capstoneproject.fridge.entity.InputMethod;
import capstone.capstoneproject.fridge.entity.IngredientMaster;
import capstone.capstoneproject.fridge.repository.FridgeItemRepository;
import capstone.capstoneproject.fridge.repository.IngredientMasterRepository;
import capstone.capstoneproject.member.entity.Member;
import capstone.capstoneproject.member.repository.MemberRepository;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class FridgeItemService {

    private final FridgeItemRepository fridgeItemRepository;
    private final IngredientMasterRepository ingredientMasterRepository;
    private final MemberRepository memberRepository;

    public FridgeItemService(
            FridgeItemRepository fridgeItemRepository,
            IngredientMasterRepository ingredientMasterRepository,
            MemberRepository memberRepository
    ) {
        this.fridgeItemRepository = fridgeItemRepository;
        this.ingredientMasterRepository = ingredientMasterRepository;
        this.memberRepository = memberRepository;
    }

    @Transactional
    public FridgeItemResponse create(Long memberId, FridgeItemCreateRequest request) {
        //TODO 현재는 헤더로 받은 개발 회원 ID를 사용하며, 추후 인증 주체로 교체한다.
        Member member = findMember(memberId);
        IngredientMaster ingredient = findIngredient(request.ingredientName());
        Compartment compartment = request.compartment() == null
                // 칸을 생략하면 표준 재료 마스터의 기본 칸을 적용한다.
                ? ingredient.getDefaultCompartment()
                : request.compartment();
        FridgeItem item = new FridgeItem(
                member,
                ingredient,
                compartment,
                request.quantity(),
                request.unit(),
                request.expiryDate(),
                LocalDate.now(),
                InputMethod.MANUAL
        );
        return FridgeItemResponse.from(fridgeItemRepository.save(item), LocalDate.now());
    }

    @Transactional
    public List<FridgeItemResponse> findAll(
            Long memberId,
            String keyword,
            Compartment compartment,
            String sort,
            String direction
    ) {
        // 서버 재시작 이후에도 조회 시점에 만료 상태가 보정되도록 먼저 처리한다.
        discardExpiredItems();
        Member member = findMember(memberId);
        boolean descending = "desc".equalsIgnoreCase(direction);
        Comparator<FridgeItem> comparator = "name".equalsIgnoreCase(sort)
                ? Comparator.comparing(item -> item.getIngredientMaster().getName())
                : Comparator.comparing(FridgeItem::getExpiryDate);
        if (descending) {
            comparator = comparator.reversed();
        }
        return fridgeItemRepository.findAllByMemberAndStatus(member, FridgeItemStatus.STORED).stream()
                .filter(item -> keyword == null || keyword.isBlank()
                        || item.getIngredientMaster().getName().contains(keyword))
                .filter(item -> compartment == null || item.getCompartment() == compartment)
                .sorted(comparator)
                .map(item -> FridgeItemResponse.from(item, LocalDate.now()))
                .toList();
    }

    @Transactional
    public FridgeItemResponse findOne(Long memberId, Long itemId) {
        discardExpiredItems();
        return FridgeItemResponse.from(findItem(memberId, itemId), LocalDate.now());
    }

    @Transactional
    public FridgeItemResponse update(Long memberId, Long itemId, FridgeItemUpdateRequest request) {
        FridgeItem item = findItem(memberId, itemId);
        IngredientMaster ingredient = findIngredient(request.ingredientName());
        item.update(
                ingredient,
                request.compartment() == null ? ingredient.getDefaultCompartment() : request.compartment(),
                request.quantity(),
                request.unit(),
                request.expiryDate()
        );
        return FridgeItemResponse.from(item, LocalDate.now());
    }

    @Transactional
    public void delete(Long memberId, Long itemId) {
        fridgeItemRepository.delete(findItem(memberId, itemId));
    }

    @Transactional
    public int discardExpiredItems() {
        // 유통기한 당일은 사용 가능하므로 오늘보다 이전인 재료만 폐기한다.
        return fridgeItemRepository.discardExpiredItems(LocalDate.now());
    }

    private Member findMember(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원을 찾을 수 없습니다."));
    }

    private FridgeItem findItem(Long memberId, Long itemId) {
        return fridgeItemRepository.findByIdAndMember(itemId, findMember(memberId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "재료를 찾을 수 없습니다."));
    }

    private IngredientMaster findIngredient(String name) {
        return ingredientMasterRepository.findByName(name)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "등록된 재료 마스터가 없습니다: " + name));
    }
}
