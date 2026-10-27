package com.marketplace.controller;

import com.marketplace.entity.Dispute;
import com.marketplace.entity.Order;
import com.marketplace.entity.ReturnRequest;
import com.marketplace.entity.Vendor;
import com.marketplace.service.DisputeService;
import com.marketplace.service.OrderService;
import com.marketplace.service.ReturnService;
import com.marketplace.service.VendorService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final VendorService vendors;
    private final DisputeService disputes;
    private final OrderService orders;
    private final ReturnService returns;

    public AdminController(VendorService vendors,
                           DisputeService disputes,
                           OrderService orders,
                           ReturnService returns) {
        this.vendors = vendors;
        this.disputes = disputes;
        this.orders = orders;
        this.returns = returns;
    }

    @GetMapping("/orders")
    public List<Order> orders() {
        return orders.allOrders();
    }

    @GetMapping("/returns")
    public List<ReturnRequest> returns() {
        return returns.all();
    }

    @GetMapping("/vendors")
    public List<Vendor> vendors() {
        return vendors.all();
    }

    @PutMapping("/vendors/{id}/approve")
    public Vendor approve(@PathVariable UUID id) {
        return vendors.approve(id);
    }

    @PutMapping("/vendors/{id}/reject")
    public Vendor reject(@PathVariable UUID id) {
        return vendors.reject(id);
    }

    @GetMapping("/disputes")
    public List<Dispute> disputes() {
        return disputes.all();
    }

    @PutMapping("/disputes/{id}/resolve")
    public Dispute resolve(@PathVariable UUID id,
                           @RequestParam String resolution) {
        return disputes.resolve(id, resolution);
    }
}
