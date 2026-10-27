package com.marketplace.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.marketplace.entity.enums.ReturnStatus;
import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "returns")
public class ReturnRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "sub_order_id")
    @JsonIgnore
    public SubOrder subOrder;

    @ManyToOne(optional = false)
    @JoinColumn(name = "buyer_id")
    @JsonIgnore
    public User buyer;

    public String reason;

    @Enumerated(EnumType.STRING)
    public ReturnStatus status = ReturnStatus.REQUESTED;

    public double refundAmount;
    public String vendorComment;
    public String reverseAwb;
    public LocalDateTime resolvedAt;
    public LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    @JsonProperty("subOrderId")
    public UUID getSubOrderId() {
        return subOrder != null ? subOrder.id : null;
    }

    @JsonProperty("buyerName")
    public String getBuyerName() {
        return buyer != null ? buyer.fullName : null;
    }

    @JsonProperty("buyerEmail")
    public String getBuyerEmail() {
        return buyer != null ? buyer.email : null;
    }

    @JsonProperty("vendorStoreName")
    public String getVendorStoreName() {
        return (subOrder != null && subOrder.vendor != null) ? subOrder.vendor.storeName : null;
    }

    @JsonProperty("itemSummaries")
    public List<String> getItemSummaries() {
        try {
            if (subOrder != null && subOrder.order != null && subOrder.order.items != null) {
                List<String> list = new ArrayList<>();
                for (OrderItem item : subOrder.order.items) {
                    if (subOrder.vendor != null && item.vendorId != null && item.vendorId.equals(subOrder.vendor.id)) {
                        String sku = (item.variant != null && item.variant.sku != null) ? item.variant.sku : "Item";
                        String title = (item.variant != null && item.variant.product != null && item.variant.product.title != null)
                                ? item.variant.product.title : "";
                        list.add((title.isEmpty() ? sku : title + " (" + sku + ")") + " × " + item.quantity);
                    }
                }
                return list;
            }
        } catch (Exception ignored) {
        }
        return Collections.emptyList();
    }
}
