package com.marketplace.controller;

import com.marketplace.entity.Payment;
import com.marketplace.service.PaymentService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {
    private final PaymentService payments;

    public PaymentController(PaymentService payments) {
        this.payments = payments;
    }

    @PostMapping("/capture/{orderId}")
    public Payment capture(@PathVariable UUID orderId,
                           Authentication authentication) {
        return payments.capture(orderId, authentication.getName());
    }

    @GetMapping("/{id}")
    public Payment get(@PathVariable UUID id, Authentication authentication) {
        return payments.get(id, authentication.getName());
    }
}
