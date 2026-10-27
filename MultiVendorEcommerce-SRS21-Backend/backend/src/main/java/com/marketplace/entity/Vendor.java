package com.marketplace.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.marketplace.entity.enums.VendorStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "vendors")
public class Vendor {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", unique = true)
    @JsonIgnore
    public User user;

    @Column(nullable = false)
    public String businessName;

    public String businessType;
    public String phone;
    public String gstin;
    public String pan;
    public String storeName;
    public String storeDescription;
    public String returnPolicy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public VendorStatus status = VendorStatus.PENDING;

    @Column(nullable = false)
    public boolean gstVerified = false;

    @Column(nullable = false)
    public boolean bankVerified = false;

    public LocalDateTime approvedAt;
    public LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
