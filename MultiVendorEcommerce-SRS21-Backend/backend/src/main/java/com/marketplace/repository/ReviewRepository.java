package com.marketplace.repository;

import com.marketplace.entity.Product;
import com.marketplace.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findByProductOrderByCreatedAtDesc(Product product);
}
