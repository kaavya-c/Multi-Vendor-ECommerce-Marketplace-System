package com.marketplace.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class CartRequest {
    @NotNull
    public UUID variantId;

    @Min(1)
    public int quantity;
}
