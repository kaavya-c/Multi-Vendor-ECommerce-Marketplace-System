package com.marketplace.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class ReviewRequest {
    @NotNull
    public UUID productId;

    @Min(1)
    @Max(5)
    public int rating;

    public String comment;
}
