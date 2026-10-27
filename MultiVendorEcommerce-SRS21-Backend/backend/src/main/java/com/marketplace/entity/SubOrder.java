package com.marketplace.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.marketplace.entity.enums.OrderStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sub_orders")
public class SubOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "order_id")
    @JsonIgnore
    public Order order;

    @ManyToOne(optional = false)
    @JoinColumn(name = "vendor_id")
    public Vendor vendor;

    @Enumerated(EnumType.STRING)
    public OrderStatus status = OrderStatus.PLACED;

    public String awbNumber;
    public String courierName;
    public double commissionAmount;
    public double payoutAmount;
    public LocalDateTime dispatchedAt;
    public LocalDateTime deliveredAt;

}
