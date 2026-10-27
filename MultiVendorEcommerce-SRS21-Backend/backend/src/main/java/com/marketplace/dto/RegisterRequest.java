package com.marketplace.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
    @NotBlank
    public String fullName;

    @NotBlank
    @Email
    public String email;

    @NotBlank
    @Size(min = 6)
    public String password;
}
