package com.marketplace.entity;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(
        name = "wishlist",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"buyer_id", "product_id"})
        }
)
public class Wishlist {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "buyer_id")
    public User buyer;

    @ManyToOne(optional = false)
    @JoinColumn(name = "product_id")
    public Product product;
}