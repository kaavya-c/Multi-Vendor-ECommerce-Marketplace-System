package com.marketplace.repository;

import com.marketplace.entity.Product;
import com.marketplace.entity.Vendor;
import com.marketplace.entity.enums.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {
    List<Product> findByStatus(ProductStatus status);
    List<Product> findByVendor(Vendor vendor);
}
