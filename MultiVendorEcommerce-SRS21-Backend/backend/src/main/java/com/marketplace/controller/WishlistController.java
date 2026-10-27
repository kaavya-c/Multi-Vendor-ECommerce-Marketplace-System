package com.marketplace.controller;

import com.marketplace.entity.Wishlist;
import com.marketplace.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    /**
     * Get the logged-in buyer's wishlist.
     *
     * GET /api/v1/wishlist
     */
    @GetMapping
    public List<Wishlist> getWishlist(
            Authentication authentication) {

        return wishlistService.getWishlist(
                authentication.getName()
        );
    }

    /**
     * Add a product to the wishlist.
     *
     * POST /api/v1/wishlist/{productId}
     */
    @PostMapping("/{productId}")
    public Wishlist addToWishlist(
            @PathVariable UUID productId,
            Authentication authentication) {

        return wishlistService.addToWishlist(
                authentication.getName(),
                productId
        );
    }

    /**
     * Remove a product from the wishlist.
     *
     * DELETE /api/v1/wishlist/{productId}
     */
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFromWishlist(
            @PathVariable UUID productId,
            Authentication authentication) {

        wishlistService.removeFromWishlist(
                authentication.getName(),
                productId
        );

        return ResponseEntity.noContent().build();
    }

    /**
     * Check whether a product is wishlisted.
     *
     * GET /api/v1/wishlist/{productId}/status
     */
    @GetMapping("/{productId}/status")
    public boolean isWishlisted(
            @PathVariable UUID productId,
            Authentication authentication) {

        return wishlistService.isWishlisted(
                authentication.getName(),
                productId
        );
    }

    /**
     * Get wishlist item count.
     *
     * GET /api/v1/wishlist/count
     */
    @GetMapping("/count")
    public long getWishlistCount(
            Authentication authentication) {

        return wishlistService.getWishlistCount(
                authentication.getName()
        );
    }
}