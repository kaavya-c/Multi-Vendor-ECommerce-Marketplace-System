package com.marketplace.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "order_id")
    @JsonIgnore
    public Order order;

    @ManyToOne(optional = false)
    @JoinColumn(name = "variant_id")
    public ProductVariant variant;

    public int quantity;
    public double unitPrice;
    public UUID vendorId;
    public double commissionAmount;
    public double payoutAmount;
}
