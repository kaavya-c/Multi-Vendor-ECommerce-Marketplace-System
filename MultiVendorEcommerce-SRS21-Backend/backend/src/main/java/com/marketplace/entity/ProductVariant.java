//package com.marketplace.entity;
//
//import com.fasterxml.jackson.annotation.JsonIgnore;
//import jakarta.persistence.*;
//
//import java.util.UUID;
//
//@Entity
//@Table(name = "product_variants")
//public class ProductVariant {
//    @Id
//    @GeneratedValue(strategy = GenerationType.UUID)
//    public UUID id;
//
//    @ManyToOne(optional = false)
//    @JoinColumn(name = "product_id")
//    @JsonIgnore
//    public Product product;
//
//    @Column(nullable = false, unique = true)
//    public String sku;
//
//    public String size;
//    public String colour;
//    public String material;
//    public double price;
//    public int stockQuantity;
//    public int reservedQuantity;
//    public boolean active = true;
//}

package com.marketplace.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "product_variants")
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "product_id")
    @JsonIgnore
    public Product product;

    @Column(nullable = false, unique = true)
    public String sku;

    public String model;

    public String colour;

    public double price;

    public int stockQuantity;

    public int reservedQuantity;

    public boolean active = true;
}
