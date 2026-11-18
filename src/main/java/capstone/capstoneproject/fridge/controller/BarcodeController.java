package capstone.capstoneproject.fridge.controller;

import capstone.capstoneproject.fridge.dto.BarcodeLookupResponse;
import capstone.capstoneproject.fridge.service.BarcodeLookupService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/fridge/barcodes")
public class BarcodeController {

    private final BarcodeLookupService barcodeLookupService;

    public BarcodeController(BarcodeLookupService barcodeLookupService) {
        this.barcodeLookupService = barcodeLookupService;
    }

    @GetMapping("/{barcode}")
    public BarcodeLookupResponse lookup(@PathVariable String barcode) {
        return barcodeLookupService.lookup(barcode);
    }
}
