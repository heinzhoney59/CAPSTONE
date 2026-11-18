package capstone.capstoneproject.fridge.service;

import capstone.capstoneproject.fridge.dto.FridgeItemCreateRequest;
import capstone.capstoneproject.fridge.dto.ShoppingDtos;
import capstone.capstoneproject.fridge.entity.IngredientMaster;
import capstone.capstoneproject.fridge.entity.IngredientUnit;
import capstone.capstoneproject.fridge.entity.InputMethod;
import capstone.capstoneproject.fridge.entity.ShoppingChecklist;
import capstone.capstoneproject.fridge.entity.ShoppingChecklistItem;
import capstone.capstoneproject.fridge.entity.ShoppingChecklistStatus;
import capstone.capstoneproject.fridge.repository.IngredientMasterRepository;
import capstone.capstoneproject.fridge.repository.ShoppingChecklistRepository;
import capstone.capstoneproject.member.entity.Member;
import capstone.capstoneproject.member.repository.MemberRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class ShoppingChecklistService {

    private final ShoppingChecklistRepository checklistRepository;
    private final IngredientMasterRepository ingredientMasterRepository;
    private final MemberRepository memberRepository;
    private final FridgeItemService fridgeItemService;

    public ShoppingChecklistService(
            ShoppingChecklistRepository checklistRepository,
            IngredientMasterRepository ingredientMasterRepository,
            MemberRepository memberRepository,
            FridgeItemService fridgeItemService
    ) {
        this.checklistRepository = checklistRepository;
        this.ingredientMasterRepository = ingredientMasterRepository;
        this.memberRepository = memberRepository;
        this.fridgeItemService = fridgeItemService;
    }

    @Transactional
    public ShoppingDtos.ChecklistResponse create(Long memberId, ShoppingDtos.CreateRequest request) {
        Member member = findMember(memberId);
        ShoppingChecklist checklist = new ShoppingChecklist(member);
        for (ShoppingDtos.ItemRequest itemRequest : request.items()) {
            IngredientMaster ingredient = ingredientMasterRepository.findByName(itemRequest.ingredientName().trim())
                    .orElse(null);
            checklist.addItem(new ShoppingChecklistItem(
                    ingredient,
                    itemRequest.ingredientName().trim(),
                    itemRequest.quantity(),
                    itemRequest.unit()
            ));
        }
        return toResponse(checklistRepository.save(checklist));
    }

    public List<ShoppingDtos.ChecklistResponse> findActive(Long memberId) {
        Member member = findMember(memberId);
        return checklistRepository.findAllByMemberAndStatus(member, ShoppingChecklistStatus.ACTIVE)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ShoppingDtos.ChecklistResponse findOne(Long memberId, Long checklistId) {
        return toResponse(findOwned(memberId, checklistId));
    }

    @Transactional
    public ShoppingDtos.ChecklistResponse setPurchased(
            Long memberId,
            Long checklistId,
            Long itemId,
            ShoppingDtos.PurchasedRequest request
    ) {
        ShoppingChecklistItem item = findItem(findOwned(memberId, checklistId), itemId);
        item.markPurchased(request.purchased());
        return toResponse(findOwned(memberId, checklistId));
    }

    @Transactional
    public ShoppingDtos.RegisterResponse registerPurchased(Long memberId, Long checklistId) {
        ShoppingChecklist checklist = findOwned(memberId, checklistId);
        int registered = 0;
        int skipped = 0;
        for (ShoppingChecklistItem item : checklist.getItems()) {
            if (!item.isPurchased() || item.isRegistered()) {
                continue;
            }
            if (item.getIngredient() == null) {
                skipped++;
                continue;
            }
            fridgeItemService.create(memberId, new FridgeItemCreateRequest(
                    item.getIngredient().getName(),
                    null,
                    item.getQuantity(),
                    item.getUnit(),
                    null
            ));
            item.markRegistered();
            registered++;
        }
        if (registered > 0 && checklist.getItems().stream().allMatch(item ->
                item.isRegistered() || !item.isPurchased())) {
            checklist.complete();
        }
        return new ShoppingDtos.RegisterResponse(registered, skipped);
    }

    private ShoppingChecklist findOwned(Long memberId, Long checklistId) {
        Member member = findMember(memberId);
        return checklistRepository.findAllByMemberAndStatus(member, ShoppingChecklistStatus.ACTIVE)
                .stream()
                .filter(checklist -> checklist.getId().equals(checklistId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "장보기 체크리스트를 찾을 수 없습니다."));
    }

    private ShoppingChecklistItem findItem(ShoppingChecklist checklist, Long itemId) {
        return checklist.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "체크리스트 항목을 찾을 수 없습니다."));
    }

    private Member findMember(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원을 찾을 수 없습니다."));
    }

    private ShoppingDtos.ChecklistResponse toResponse(ShoppingChecklist checklist) {
        List<ShoppingDtos.ItemResponse> items = checklist.getItems().stream()
                .map(item -> new ShoppingDtos.ItemResponse(
                        item.getId(),
                        item.getIngredientName(),
                        item.getQuantity(),
                        item.getUnit(),
                        item.isPurchased(),
                        item.isRegistered()
                ))
                .toList();
        return new ShoppingDtos.ChecklistResponse(
                checklist.getId(),
                checklist.getStatus().name(),
                checklist.getCreatedAt(),
                items
        );
    }
}
