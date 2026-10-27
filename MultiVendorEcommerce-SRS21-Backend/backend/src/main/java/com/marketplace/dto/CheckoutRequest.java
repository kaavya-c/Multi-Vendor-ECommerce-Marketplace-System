package com.marketplace.dto;

import jakarta.validation.constraints.NotBlank;

public class CheckoutRequest {
    @NotBlank
    public String shippingAddress;

    @NotBlank
    public String paymentMethod;
}
