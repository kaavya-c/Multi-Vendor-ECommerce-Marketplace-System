package com.marketplace.controller;

import com.marketplace.dto.ReviewRequest;
import com.marketplace.entity.Review;
import com.marketplace.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reviews")
public class ReviewController {
    private final ReviewService reviews;

    public ReviewController(ReviewService reviews) {
        this.reviews = reviews;
    }

    @PostMapping
    public Review create(@Valid @RequestBody ReviewRequest request,
                         Authentication authentication) {
        return reviews.create(request, authentication.getName());
    }

    @GetMapping("/product/{productId}")
    public List<Review> byProduct(@PathVariable UUID productId) {
        return reviews.byProduct(productId);
    }
}
