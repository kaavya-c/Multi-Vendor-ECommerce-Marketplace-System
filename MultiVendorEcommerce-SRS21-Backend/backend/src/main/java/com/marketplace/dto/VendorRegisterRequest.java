package com.marketplace.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public class VendorRegisterRequest {
    public UUID userId;

    @NotBlank
    public String businessName;

    @NotBlank
    public String businessType;

    @NotBlank
    public String phone;

    public String gstin;
    public String pan;
    public String storeName;
    public String storeDescription;
    public String returnPolicy;
}
