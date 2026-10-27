package com.marketplace.controller;

import com.marketplace.dto.CartRequest;
import com.marketplace.entity.CartItem;
import com.marketplace.service.CartService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cart")
@PreAuthorize("hasRole('BUYER')")
public class CartController {
    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public List<CartItem> get(Authentication authentication) {
        return cartService.get(authentication.getName());
    }

    @PostMapping("/items")
    public CartItem add(@Valid @RequestBody CartRequest request,
                        Authentication authentication) {
        return cartService.add(authentication.getName(), request);
    }

    @DeleteMapping("/items/{id}")
    public void remove(@PathVariable UUID id, Authentication authentication) {
        cartService.remove(authentication.getName(), id);
    }
}
