package com.marketplace.repository;

import com.marketplace.entity.CartItem;
import com.marketplace.entity.ProductVariant;
import com.marketplace.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CartItemRepository extends JpaRepository<CartItem, UUID> {
    List<CartItem> findByBuyer(User buyer);
    Optional<CartItem> findByBuyerAndVariant(User buyer, ProductVariant variant);
}
