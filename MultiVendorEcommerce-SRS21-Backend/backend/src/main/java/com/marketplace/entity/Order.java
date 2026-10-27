package com.marketplace.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.marketplace.entity.enums.OrderStatus;
import com.marketplace.entity.enums.PaymentStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "buyer_id")
    @JsonIgnore
    public User buyer;

    public double totalAmount;

    @Enumerated(EnumType.STRING)
    public PaymentStatus paymentStatus = PaymentStatus.PENDING;

    public String paymentMethod;
    public String paymentTransactionId;
    public String shippingAddress;

    @Enumerated(EnumType.STRING)
    public OrderStatus status = OrderStatus.PLACED;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    public List<OrderItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    public List<SubOrder> subOrders = new ArrayList<>();

//    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
//    public List<OrderItem> items = new ArrayList<>();
//
//    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
//    public List<SubOrder> subOrders = new ArrayList<>();

    public LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    @com.fasterxml.jackson.annotation.JsonProperty("buyerName")
    public String getBuyerName() {
        return buyer != null ? buyer.fullName : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("buyerEmail")
    public String getBuyerEmail() {
        return buyer != null ? buyer.email : null;
    }
}
