package com.marketplace.repository;

import com.marketplace.entity.Product;
import com.marketplace.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, UUID> {
    List<ProductVariant> findByProduct(Product product);
    boolean existsBySkuIgnoreCase(String sku);
}
