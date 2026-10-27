package com.marketplace.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.UUID;

public class ProductRequest {
    @NotBlank
    public String title;

    public String description;
    public String brand;
    public String hsnCode;

    @Positive
    public double mrp;

    @Positive
    public double sellingPrice;

    public double gstRate;
    public String imageUrl;
    public String videoUrl;

    @NotNull
    public UUID categoryId;

    public UUID vendorId;
}
