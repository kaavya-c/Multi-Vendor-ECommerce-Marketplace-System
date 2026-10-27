package com.marketplace.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class ReturnRequestDto {
    @NotNull
    public UUID subOrderId;

    @NotBlank
    public String reason;
}
