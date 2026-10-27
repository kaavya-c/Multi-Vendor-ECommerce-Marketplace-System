package com.marketplace.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.marketplace.entity.enums.PaymentStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @OneToOne(optional = false)
    @JoinColumn(name = "order_id", unique = true)
    @JsonIgnore
    public Order order;

    public double amount;

    @Enumerated(EnumType.STRING)
    public PaymentStatus status = PaymentStatus.PENDING;

    public String transactionId;
    public LocalDateTime paidAt;
}
