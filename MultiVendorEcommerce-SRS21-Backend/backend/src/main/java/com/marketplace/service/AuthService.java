package com.marketplace.service;

import com.marketplace.dto.LoginRequest;
import com.marketplace.dto.RegisterRequest;
import com.marketplace.entity.User;
import com.marketplace.entity.enums.Role;
import com.marketplace.exception.BusinessException;
import com.marketplace.repository.UserRepository;
import com.marketplace.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;

    public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwtService) {
        this.users = users;
        this.encoder = encoder;
        this.jwtService = jwtService;
    }

    public User register(RegisterRequest request) {
        if (users.existsByEmail(request.email.toLowerCase())) {
            throw new BusinessException("Email already registered");
        }

        User user = new User();
        user.fullName = request.fullName.trim();
        user.email = request.email.toLowerCase().trim();
        user.password = encoder.encode(request.password);
        user.role = Role.BUYER;
        return users.save(user);
    }

    public User authenticate(LoginRequest request) {
        User user = users.findByEmail(request.email.toLowerCase().trim())
                .orElseThrow(() -> new BusinessException("Invalid credentials"));

        if (!user.active || !encoder.matches(request.password, user.password)) {
            throw new BusinessException("Invalid credentials");
        }
        return user;
    }

    public String token(User user) {
        return jwtService.generate(user);
    }
}
