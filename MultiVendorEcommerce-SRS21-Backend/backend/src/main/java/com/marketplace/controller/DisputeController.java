package com.marketplace.controller;

import com.marketplace.entity.Dispute;
import com.marketplace.service.DisputeService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/disputes")
public class DisputeController {
    private final DisputeService disputes;

    public DisputeController(DisputeService disputes) {
        this.disputes = disputes;
    }

    @PostMapping
    public Dispute create(@RequestParam UUID orderId,
                          @RequestParam String type,
                          @RequestParam String description,
                          Authentication authentication) {
        return disputes.create(orderId, type, description, authentication.getName());
    }
}
