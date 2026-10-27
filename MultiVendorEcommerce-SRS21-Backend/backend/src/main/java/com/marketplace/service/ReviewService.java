package com.marketplace.service;

import com.marketplace.dto.ReviewRequest;
import com.marketplace.entity.Product;
import com.marketplace.entity.Review;
import com.marketplace.entity.User;
import com.marketplace.exception.ResourceNotFoundException;
import com.marketplace.repository.ProductRepository;
import com.marketplace.repository.ReviewRepository;
import com.marketplace.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ReviewService {
    private final ReviewRepository reviews;
    private final ProductRepository products;
    private final UserRepository users;

    public ReviewService(ReviewRepository reviews,
                         ProductRepository products,
                         UserRepository users) {
        this.reviews = reviews;
        this.products = products;
        this.users = users;
    }

    public Review create(ReviewRequest request, String email) {
        User buyer = users.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Product product = products.findById(request.productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Review review = new Review();
        review.buyer = buyer;
        review.product = product;
        review.rating = request.rating;
        review.comment = request.comment;
        return reviews.save(review);
    }

    public List<Review> byProduct(UUID productId) {
        Product product = products.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return reviews.findByProductOrderByCreatedAtDesc(product);
    }
}
