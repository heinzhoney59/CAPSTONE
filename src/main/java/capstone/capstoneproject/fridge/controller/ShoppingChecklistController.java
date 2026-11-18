package capstone.capstoneproject.fridge.controller;

import capstone.capstoneproject.fridge.dto.ShoppingDtos;
import capstone.capstoneproject.fridge.service.ShoppingChecklistService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/shopping-checklists")
public class ShoppingChecklistController {

    private final ShoppingChecklistService service;

    public ShoppingChecklistController(ShoppingChecklistService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ShoppingDtos.ChecklistResponse create(
            @RequestHeader(value = "X-Member-Id", defaultValue = "1") Long memberId,
            @Valid @RequestBody ShoppingDtos.CreateRequest request
    ) {
        return service.create(memberId, request);
    }

    @GetMapping
    public List<ShoppingDtos.ChecklistResponse> findActive(
            @RequestHeader(value = "X-Member-Id", defaultValue = "1") Long memberId
    ) {
        return service.findActive(memberId);
    }

    @GetMapping("/{checklistId}")
    public ShoppingDtos.ChecklistResponse findOne(
            @RequestHeader(value = "X-Member-Id", defaultValue = "1") Long memberId,
            @PathVariable Long checklistId
    ) {
        return service.findOne(memberId, checklistId);
    }

    @PatchMapping("/{checklistId}/items/{itemId}")
    public ShoppingDtos.ChecklistResponse setPurchased(
            @RequestHeader(value = "X-Member-Id", defaultValue = "1") Long memberId,
            @PathVariable Long checklistId,
            @PathVariable Long itemId,
            @Valid @RequestBody ShoppingDtos.PurchasedRequest request
    ) {
        return service.setPurchased(memberId, checklistId, itemId, request);
    }

    @PostMapping("/{checklistId}/register")
    public ShoppingDtos.RegisterResponse registerPurchased(
            @RequestHeader(value = "X-Member-Id", defaultValue = "1") Long memberId,
            @PathVariable Long checklistId
    ) {
        return service.registerPurchased(memberId, checklistId);
    }
}
