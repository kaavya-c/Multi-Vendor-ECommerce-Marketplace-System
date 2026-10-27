package com.marketplace.entity;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @Column(nullable = false, unique = true)
    public String name;

    public String description;
    public UUID parentId;
    public int level = 1;
    public double commissionDefault = 10.0;
    public double gstDefault = 18.0;
    public boolean active = true;
}
