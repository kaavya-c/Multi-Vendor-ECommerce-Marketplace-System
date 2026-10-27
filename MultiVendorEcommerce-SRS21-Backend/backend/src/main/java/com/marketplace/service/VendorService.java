package com.marketplace.service;

import com.marketplace.dto.VendorRegisterRequest;
import com.marketplace.entity.User;
import com.marketplace.entity.Vendor;
import com.marketplace.entity.enums.Role;
import com.marketplace.entity.enums.VendorStatus;
import com.marketplace.exception.BusinessException;
import com.marketplace.exception.ResourceNotFoundException;
import com.marketplace.repository.UserRepository;
import com.marketplace.repository.VendorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class VendorService {
    private final VendorRepository vendors;
    private final UserRepository users;

    public VendorService(VendorRepository vendors, UserRepository users) {
        this.vendors = vendors;
        this.users = users;
    }

    @Transactional
    public Vendor register(VendorRegisterRequest request, String email) {
        User user = resolveUser(request.userId, email);

        if (vendors.findByUser(user).isPresent()) {
            throw new BusinessException("Vendor application already exists for this account");
        }

        Vendor vendor = new Vendor();
        vendor.user = user;
        vendor.businessName = request.businessName.trim();
        vendor.businessType = request.businessType.trim();
        vendor.phone = request.phone.trim();
        vendor.gstin = request.gstin;
        vendor.pan = request.pan;
        vendor.storeName = request.storeName == null ? request.businessName : request.storeName;
        vendor.storeDescription = request.storeDescription;
        vendor.returnPolicy = request.returnPolicy;
        vendor.status = VendorStatus.PENDING;

        return vendors.save(vendor);
    }

    public Vendor myVendor(String email) {
        User user = users.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return vendors.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found"));
    }

    public List<Vendor> all() {
        return vendors.findAll();
    }

    @Transactional
    public Vendor approve(UUID id) {
        Vendor vendor = vendors.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found"));
        vendor.status = VendorStatus.APPROVED;
        vendor.gstVerified = true;
        vendor.bankVerified = true;
        vendor.approvedAt = LocalDateTime.now();
        vendor.user.role = Role.VENDOR;
        users.save(vendor.user);
        return vendors.save(vendor);
    }

    @Transactional
    public Vendor reject(UUID id) {
        Vendor vendor = vendors.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found"));
        vendor.status = VendorStatus.REJECTED;
        vendor.user.role = Role.BUYER;
        users.save(vendor.user);
        return vendors.save(vendor);
    }

    private User resolveUser(UUID userId, String email) {
        if (userId != null) {
            return users.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        }
        return users.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
