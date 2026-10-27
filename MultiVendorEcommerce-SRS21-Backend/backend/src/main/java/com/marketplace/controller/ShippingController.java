package com.marketplace.controller;

import com.marketplace.dto.PickupRequestDto;
import com.marketplace.dto.ShipmentRequestDto;
import com.marketplace.dto.ShippingRateDto;
import com.marketplace.dto.TrackingResponseDto;
import com.marketplace.entity.SubOrder;
import com.marketplace.service.ShipRocketService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/shipping")
public class ShippingController {

    private final ShipRocketService shipRocketService;

    public ShippingController(ShipRocketService shipRocketService) {
        this.shipRocketService = shipRocketService;
    }

    /**
     * FR8: Courier shipping rates comparison
     */
    @GetMapping("/rates")
    public List<ShippingRateDto> getRates(@RequestParam(defaultValue = "560001") String pickupPincode,
                                         @RequestParam(defaultValue = "110001") String deliveryPincode,
                                         @RequestParam(defaultValue = "0.5") double weight) {
        return shipRocketService.calculateRates(pickupPincode, deliveryPincode, weight);
    }

    /**
     * FR8: Vendor ships sub-order with selected ShipRocket courier and generates electronic AWB
     */
    @PostMapping("/sub-orders/{subOrderId}/ship")
    @PreAuthorize("hasRole('VENDOR')")
    public SubOrder shipOrder(@PathVariable UUID subOrderId,
                              @RequestBody(required = false) ShipmentRequestDto request,
                              Authentication authentication) {
        return shipRocketService.shipOrder(subOrderId, request, authentication != null ? authentication.getName() : null);
    }

    /**
     * FR8: Vendor schedules courier pickup
     */
    @PostMapping("/sub-orders/{subOrderId}/schedule-pickup")
    @PreAuthorize("hasRole('VENDOR')")
    public Map<String, Object> schedulePickup(@PathVariable UUID subOrderId,
                                             @RequestBody(required = false) PickupRequestDto request,
                                             Authentication authentication) {
        return shipRocketService.schedulePickup(subOrderId, request, authentication != null ? authentication.getName() : null);
    }

    /**
     * FR8: Printable standard shipping label
     */
    @GetMapping(value = "/sub-orders/{subOrderId}/label", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> getShippingLabel(@PathVariable UUID subOrderId) {
        String html = shipRocketService.generateShippingLabel(subOrderId);
        return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(html);
    }

    /**
     * FR6 & FR8: Real-time tracking by SubOrder ID
     */
    @GetMapping("/sub-orders/{subOrderId}/track")
    public TrackingResponseDto trackSubOrder(@PathVariable UUID subOrderId) {
        return shipRocketService.getTrackingDetails(subOrderId, null);
    }

    /**
     * FR6 & FR8: Real-time tracking by AWB number
     */
    @GetMapping("/track/{awbNumber}")
    public TrackingResponseDto trackByAwb(@PathVariable String awbNumber) {
        return shipRocketService.getTrackingDetails(null, awbNumber);
    }

    /**
     * FR8 & Appendix E.2: ShipRocket tracking webhook listener
     */
    @PostMapping("/webhook/shiprocket")
    public Map<String, Object> webhook(@RequestBody Map<String, Object> payload) {
        return shipRocketService.handleWebhook(payload);
    }
}
