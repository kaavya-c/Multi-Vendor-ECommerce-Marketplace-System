package com.marketplace.controller;

import com.marketplace.dto.VendorRegisterRequest;
import com.marketplace.entity.Vendor;
import com.marketplace.service.VendorService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/vendors")
public class VendorController {
    private final VendorService vendors;

    public VendorController(VendorService vendors) {
        this.vendors = vendors;
    }

    @PostMapping("/register")
    public Vendor register(@Valid @RequestBody VendorRegisterRequest request,
                           Authentication authentication) {
        return vendors.register(request, authentication.getName());
    }

    @GetMapping("/me")
    public Vendor me(Authentication authentication) {
        return vendors.myVendor(authentication.getName());
    }
}
