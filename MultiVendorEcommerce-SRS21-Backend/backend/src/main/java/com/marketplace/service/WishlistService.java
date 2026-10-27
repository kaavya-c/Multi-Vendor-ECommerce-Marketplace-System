package com.marketplace.service;

import com.marketplace.entity.Product;
import com.marketplace.entity.User;
import com.marketplace.entity.Wishlist;
import com.marketplace.repository.ProductRepository;
import com.marketplace.repository.UserRepository;
import com.marketplace.repository.WishlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public WishlistService(
            WishlistRepository wishlistRepository,
            UserRepository userRepository,
            ProductRepository productRepository) {

        this.wishlistRepository = wishlistRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    /**
     * Get the current user's wishlist.
     */
    @Transactional(readOnly = true)
    public List<Wishlist> getWishlist(String email) {

        User buyer = getBuyer(email);

        return wishlistRepository.findByBuyerId(buyer.id);
    }

    /**
     * Add a product to the current user's wishlist.
     */
    @Transactional
    public Wishlist addToWishlist(String email, UUID productId) {

        User buyer = getBuyer(email);

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        // Prevent duplicate wishlist entries.
        if (wishlistRepository.existsByBuyerIdAndProductId(
                buyer.id,
                product.id)) {

            throw new RuntimeException(
                    "Product is already in your wishlist");
        }

        Wishlist wishlist = new Wishlist();

        wishlist.buyer = buyer;
        wishlist.product = product;

        return wishlistRepository.save(wishlist);
    }

    /**
     * Remove a product from the current user's wishlist.
     */
    @Transactional
    public void removeFromWishlist(String email, UUID productId) {

        User buyer = getBuyer(email);

        if (!wishlistRepository.existsByBuyerIdAndProductId(
                buyer.id,
                productId)) {

            throw new RuntimeException(
                    "Product is not in your wishlist");
        }

        wishlistRepository.deleteByBuyerIdAndProductId(
                buyer.id,
                productId);
    }

    /**
     * Check whether a product is already wishlisted
     * by the current user.
     *
     * This will be useful later for the heart/wishlist button.
     */
    @Transactional(readOnly = true)
    public boolean isWishlisted(String email, UUID productId) {

        User buyer = getBuyer(email);

        return wishlistRepository.existsByBuyerIdAndProductId(
                buyer.id,
                productId);
    }

    /**
     * Get wishlist count.
     *
     * This will be useful later for the navbar badge.
     */
    @Transactional(readOnly = true)
    public long getWishlistCount(String email) {

        User buyer = getBuyer(email);

        return wishlistRepository.findByBuyerId(buyer.id).size();
    }

    /**
     * Get the logged-in buyer.
     */
    private User getBuyer(String email) {

        User buyer = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (buyer.role == null ||
                !buyer.role.name().equals("BUYER")) {

            throw new RuntimeException(
                    "Only buyers can use the wishlist");
        }

        return buyer;
    }
}