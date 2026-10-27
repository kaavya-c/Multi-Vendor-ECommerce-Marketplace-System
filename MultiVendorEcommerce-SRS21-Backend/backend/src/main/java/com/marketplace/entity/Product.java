package com.marketplace.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.marketplace.entity.enums.ProductStatus;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @Column(nullable = false, length = 300)
    public String title;

    @Column(length = 3000)
    public String description;

    public String brand;
    public String hsnCode;
    public double mrp;
    public double sellingPrice;
    public double gstRate;
    public String imageUrl;
    public String videoUrl;
    public String metaTitle;
    public String metaDescription;
    public String slug;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public ProductStatus status = ProductStatus.PENDING;

    @ManyToOne(optional = false)
    @JoinColumn(name = "vendor_id")
    @JsonIgnore
    public Vendor vendor;

    @ManyToOne(optional = false)
    @JoinColumn(name = "category_id")
    public Category category;
}
