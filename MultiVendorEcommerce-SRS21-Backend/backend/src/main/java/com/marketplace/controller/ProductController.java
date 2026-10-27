package com.marketplace.controller;

import com.marketplace.dto.ProductRequest;
import com.marketplace.dto.VariantRequest;
import com.marketplace.entity.Product;
import com.marketplace.entity.ProductVariant;
import com.marketplace.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {
    private final ProductService products;

    public ProductController(ProductService products) {
        this.products = products;
    }

    @GetMapping
    public List<Product> all(@RequestParam(required = false) String search) {
        return products.publicProducts(search);
    }

    @GetMapping("/{id}")
    public Product get(@PathVariable UUID id) {
        return products.get(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('VENDOR')")
    public Product create(@Valid @RequestBody ProductRequest request,
                          Authentication authentication) {
        return products.create(request, authentication.getName());
    }

    @GetMapping("/vendor/mine")
    @PreAuthorize("hasRole('VENDOR')")
    public List<Product> mine(Authentication authentication) {
        return products.myProducts(authentication.getName());
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasRole('VENDOR')")
    public Product publish(@PathVariable UUID id, Authentication authentication) {
        return products.publish(id, authentication.getName());
    }

    @PostMapping("/{id}/variants")
    @PreAuthorize("hasRole('VENDOR')")
    public ProductVariant addVariant(@PathVariable UUID id,
                                     @Valid @RequestBody VariantRequest request,
                                     Authentication authentication) {
        return products.addVariant(id, request, authentication.getName());
    }

    @GetMapping("/{id}/variants")
    public List<ProductVariant> variants(@PathVariable UUID id) {
        return products.variants(id);
    }
}
