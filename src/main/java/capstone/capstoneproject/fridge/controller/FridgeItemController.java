package capstone.capstoneproject.fridge.controller;

import capstone.capstoneproject.fridge.dto.FridgeItemCreateRequest;
import capstone.capstoneproject.fridge.dto.FridgeItemConsumeRequest;
import capstone.capstoneproject.fridge.dto.FridgeItemResponse;
import capstone.capstoneproject.fridge.dto.FridgeItemUpdateRequest;
import capstone.capstoneproject.fridge.entity.Compartment;
import capstone.capstoneproject.fridge.service.FridgeItemService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/fridge/items")
public class FridgeItemController {

    private final FridgeItemService fridgeItemService;

    public FridgeItemController(FridgeItemService fridgeItemService) {
        this.fridgeItemService = fridgeItemService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FridgeItemResponse create(
            // 로그인 구현 전까지는 Postman에서 이 헤더로 테스트 회원을 지정한다.
            @RequestHeader(value = "X-Member-Id", defaultValue = "1") Long memberId,
            @Valid @RequestBody FridgeItemCreateRequest request
    ) {
        return fridgeItemService.create(memberId, request);
    }

    @GetMapping
    public List<FridgeItemResponse> findAll(
            @RequestHeader(value = "X-Member-Id", defaultValue = "1") Long memberId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Compartment compartment,
            @RequestParam(defaultValue = "expiryDate") String sort,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        // 홈 화면과 전체 보기 화면이 같은 API를 검색·필터·정렬 옵션으로 공유한다.
        return fridgeItemService.findAll(memberId, keyword, compartment, sort, direction);
    }

    @GetMapping("/{itemId}")
    public FridgeItemResponse findOne(
            @RequestHeader(value = "X-Member-Id", defaultValue = "1") Long memberId,
            @PathVariable Long itemId
    ) {
        return fridgeItemService.findOne(memberId, itemId);
    }

    @PatchMapping("/{itemId}")
    public FridgeItemResponse update(
            @RequestHeader(value = "X-Member-Id", defaultValue = "1") Long memberId,
            @PathVariable Long itemId,
            @Valid @RequestBody FridgeItemUpdateRequest request
    ) {
        return fridgeItemService.update(memberId, itemId, request);
    }

    @DeleteMapping("/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @RequestHeader(value = "X-Member-Id", defaultValue = "1") Long memberId,
            @PathVariable Long itemId
    ) {
        fridgeItemService.delete(memberId, itemId);
    }

    @PostMapping("/{itemId}/consume")
    public FridgeItemResponse consume(
            @RequestHeader(value = "X-Member-Id", defaultValue = "1") Long memberId,
            @PathVariable Long itemId,
            @Valid @RequestBody FridgeItemConsumeRequest request
    ) {
        return fridgeItemService.consume(memberId, itemId, request);
    }
}
