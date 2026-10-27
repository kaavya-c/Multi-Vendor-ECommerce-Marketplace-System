package com.marketplace.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public class VariantRequest {
    @NotBlank
    public String sku;

    public String model;
    public String colour;

    @Positive
    public double price;

    @PositiveOrZero
    public int stockQuantity;
}
