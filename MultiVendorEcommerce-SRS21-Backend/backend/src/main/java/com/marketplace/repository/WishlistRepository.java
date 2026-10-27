package com.marketplace.repository;

import com.marketplace.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface WishlistRepository extends JpaRepository<Wishlist, UUID> {

    List<Wishlist> findByBuyerId(UUID buyerId);

    boolean existsByBuyerIdAndProductId(UUID buyerId, UUID productId);

    void deleteByBuyerIdAndProductId(UUID buyerId, UUID productId);
}