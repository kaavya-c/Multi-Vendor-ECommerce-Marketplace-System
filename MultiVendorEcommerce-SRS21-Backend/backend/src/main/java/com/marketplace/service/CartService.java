package com.marketplace.service;

import com.marketplace.dto.CartRequest;
import com.marketplace.entity.CartItem;
import com.marketplace.entity.ProductVariant;
import com.marketplace.entity.User;
import com.marketplace.exception.BusinessException;
import com.marketplace.exception.ResourceNotFoundException;
import com.marketplace.repository.CartItemRepository;
import com.marketplace.repository.ProductVariantRepository;
import com.marketplace.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CartService {
    private final CartItemRepository carts;
    private final ProductVariantRepository variants;
    private final UserRepository users;

    public CartService(CartItemRepository carts,
                       ProductVariantRepository variants,
                       UserRepository users) {
        this.carts = carts;
        this.variants = variants;
        this.users = users;
    }

    public List<CartItem> get(String email) {
        return carts.findByBuyer(user(email));
    }

    public CartItem add(String email, CartRequest request) {
        User buyer = user(email);
        ProductVariant variant = variants.findById(request.variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found"));

        if (!variant.active) {
            throw new BusinessException("Variant is inactive");
        }
        if (variant.stockQuantity < request.quantity) {
            throw new BusinessException("Insufficient stock");
        }

        CartItem item = carts.findByBuyerAndVariant(buyer, variant).orElseGet(CartItem::new);
        item.buyer = buyer;
        item.variant = variant;
        item.quantity += request.quantity;
        item.priceAtAdd = variant.price;
        return carts.save(item);
    }

    public void remove(String email, UUID id) {
        CartItem item = carts.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
        if (!item.buyer.email.equals(email)) {
            throw new BusinessException("You can remove only your own cart items");
        }
        carts.delete(item);
    }

    private User user(String email) {
        User user = users.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.role != com.marketplace.entity.enums.Role.BUYER) {
            throw new BusinessException("Only buyers can access or use the shopping cart");
        }
        return user;
    }
}
