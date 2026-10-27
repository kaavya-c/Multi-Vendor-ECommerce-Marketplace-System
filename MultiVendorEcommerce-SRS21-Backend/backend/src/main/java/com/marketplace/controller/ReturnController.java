package com.marketplace.controller;

import com.marketplace.dto.ReturnRequestDto;
import com.marketplace.entity.ReturnRequest;
import com.marketplace.entity.enums.ReturnStatus;
import com.marketplace.service.ReturnService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/returns")
public class ReturnController {
    private final ReturnService returns;

    public ReturnController(ReturnService returns) {
        this.returns = returns;
    }

    @PostMapping
    public ReturnRequest create(@Valid @RequestBody ReturnRequestDto request,
                                Authentication authentication) {
        return returns.create(request, authentication.getName());
    }

    @GetMapping
    public List<ReturnRequest> myReturns(Authentication authentication) {
        return returns.byUser(authentication.getName());
    }

    @GetMapping("/vendor")
    @PreAuthorize("hasRole('VENDOR')")
    public List<ReturnRequest> vendorReturns(Authentication authentication) {
        return returns.byVendor(authentication.getName());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    public ReturnRequest updateStatus(@PathVariable UUID id,
                                      @RequestParam ReturnStatus status,
                                      @RequestParam(required = false) String comment,
                                      Authentication authentication) {
        return returns.updateStatus(id, status, comment, authentication != null ? authentication.getName() : null);
    }
}
