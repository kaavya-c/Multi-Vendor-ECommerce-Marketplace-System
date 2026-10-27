package com.marketplace.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "disputes")
public class Dispute {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "buyer_id")
    @JsonIgnore
    public User buyer;

    @ManyToOne(optional = false)
    @JoinColumn(name = "order_id")
    @JsonIgnore
    public Order order;

    public String type;
    public String description;
    public String status = "OPEN";
    public String resolution;
    public LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    @JsonProperty("orderId")
    public UUID getOrderId() {
        return order != null ? order.id : null;
    }

    @JsonProperty("buyerEmail")
    public String getBuyerEmail() {
        return buyer != null ? buyer.email : null;
    }
}
