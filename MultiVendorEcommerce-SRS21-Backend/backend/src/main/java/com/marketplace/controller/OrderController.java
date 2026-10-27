//package com.marketplace.controller;
//
//import com.marketplace.dto.CheckoutRequest;
//import com.marketplace.entity.Order;
//import com.marketplace.entity.enums.OrderStatus;
//import com.marketplace.service.OrderService;
//import jakarta.validation.Valid;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.security.core.Authentication;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//import java.util.UUID;
//
//@RestController
//@RequestMapping("/api/v1/orders")
//public class OrderController {
//    private final OrderService orders;
//
//    public OrderController(OrderService orders) {
//        this.orders = orders;
//    }
//
//    @PostMapping("/checkout")
//    public Order checkout(@Valid @RequestBody CheckoutRequest request,
//                          Authentication authentication) {
//        return orders.checkout(authentication.getName(), request);
//    }
//
//    @GetMapping
//    public List<Order> myOrders(Authentication authentication) {
//        return orders.byUser(authentication.getName());
//    }
//
//    @GetMapping("/vendor/mine")
//    @PreAuthorize("hasRole('VENDOR')")
//    public List<Order> vendorOrders(Authentication authentication) {
//        return orders.vendorOrders(authentication.getName());
//    }
//
//    @GetMapping("/{id}")
//    public Order get(@PathVariable UUID id, Authentication authentication) {
//        return orders.get(id, authentication.getName());
//    }
//
//    @PutMapping("/{id}/status")
//    @PreAuthorize("hasRole('VENDOR')")
//    public Order updateStatus(@PathVariable UUID id,
//                              @RequestParam OrderStatus status,
//                              Authentication authentication) {
//        return orders.updateStatus(id, status, authentication.getName());
//    }
//}


package com.marketplace.controller;

import com.marketplace.dto.CheckoutRequest;
import com.marketplace.entity.Order;
import com.marketplace.entity.SubOrder;
import com.marketplace.entity.enums.OrderStatus;
import com.marketplace.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orders;

    public OrderController(OrderService orders) {
        this.orders = orders;
    }

    @PostMapping("/checkout")
    @PreAuthorize("hasRole('BUYER')")
    public Order checkout(@Valid @RequestBody CheckoutRequest request,
                          Authentication authentication) {
        return orders.checkout(authentication.getName(), request);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Order> adminOrders() {
        return orders.allOrders();
    }

    @GetMapping
    public List<Order> myOrders(Authentication authentication) {
        return orders.byUser(authentication.getName());
    }

    @GetMapping("/vendor/mine")
    @PreAuthorize("hasRole('VENDOR')")
    public List<Order> vendorOrders(Authentication authentication) {
        return orders.vendorOrders(authentication.getName());
    }

    @GetMapping("/{id}")
    public Order get(@PathVariable UUID id,
                     Authentication authentication) {
        return orders.get(id, authentication.getName());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('VENDOR')")
    public Order updateStatus(@PathVariable UUID id,
                              @RequestParam OrderStatus status,
                              Authentication authentication) {
        return orders.updateStatus(id, status, authentication.getName());
    }

    @PutMapping("/sub-orders/{id}/status")
    @PreAuthorize("hasRole('VENDOR')")
    public SubOrder updateSubOrderStatus(
            @PathVariable UUID id,
            @RequestParam OrderStatus status,
            Authentication authentication) {

        return orders.updateSubOrderStatus(
                id,
                status,
                authentication.getName()
        );
    }
    @PutMapping("/sub-orders/{id}/awb")
    @PreAuthorize("hasRole('VENDOR')")
    public SubOrder updateAwb(
            @PathVariable UUID id,
            @RequestParam String awbNumber,
            Authentication authentication) {

        return orders.updateAwb(
                id,
                awbNumber,
                authentication.getName()
        );
    }
    @PutMapping("/sub-orders/{id}/cancel")
    public SubOrder cancelSubOrder(
            @PathVariable UUID id,
            Authentication authentication) {

        return orders.cancelSubOrder(
                id,
                authentication.getName()
        );
    }
}