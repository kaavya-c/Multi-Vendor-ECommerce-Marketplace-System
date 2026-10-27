package com.marketplace.service;

import com.marketplace.dto.ReturnRequestDto;
import com.marketplace.entity.OrderItem;
import com.marketplace.entity.ReturnRequest;
import com.marketplace.entity.SubOrder;
import com.marketplace.entity.User;
import com.marketplace.entity.enums.OrderStatus;
import com.marketplace.entity.enums.ReturnStatus;
import com.marketplace.exception.BusinessException;
import com.marketplace.exception.ResourceNotFoundException;
import com.marketplace.repository.ReturnRepository;
import com.marketplace.repository.SubOrderRepository;
import com.marketplace.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ReturnService {

    private final ReturnRepository returns;
    private final SubOrderRepository subOrders;
    private final UserRepository users;
    private final com.marketplace.repository.OrderRepository orders;

    public ReturnService(ReturnRepository returns,
                         SubOrderRepository subOrders,
                         UserRepository users,
                         com.marketplace.repository.OrderRepository orders) {
        this.returns = returns;
        this.subOrders = subOrders;
        this.users = users;
        this.orders = orders;
    }

    @Transactional
    public ReturnRequest create(ReturnRequestDto request, String email) {
        User buyer = users.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        SubOrder subOrder = subOrders.findById(request.subOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sub-order not found"));

        if (!subOrder.order.buyer.id.equals(buyer.id)) {
            throw new BusinessException(
                    "This sub-order does not belong to the logged-in user"
            );
        }

        if (subOrder.status != OrderStatus.DELIVERED) {
            throw new BusinessException(
                    "Return can be requested only after delivery"
            );
        }

        List<ReturnRequest> existing = returns.findBySubOrder_Id(subOrder.id);
        boolean hasActive = existing.stream().anyMatch(r ->
                r.status == ReturnStatus.REQUESTED ||
                r.status == ReturnStatus.APPROVED ||
                r.status == ReturnStatus.REFUNDED
        );
        if (hasActive) {
            throw new BusinessException(
                    "A return request is already in progress or completed for this sub-order"
            );
        }

        double refundAmount = 0;
        for (OrderItem item : subOrder.order.items) {
            if (item.vendorId.equals(subOrder.vendor.id)) {
                refundAmount += item.unitPrice * item.quantity;
            }
        }

        ReturnRequest result = new ReturnRequest();
        result.buyer = buyer;
        result.subOrder = subOrder;
        result.reason = request.reason;
        result.refundAmount = refundAmount;
        result.status = ReturnStatus.REQUESTED;

        return returns.save(result);
    }

    @Transactional(readOnly = true)
    public List<ReturnRequest> byUser(String email) {
        User buyer = users.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return returns.findByBuyerOrderByCreatedAtDesc(buyer);
    }

    @Transactional(readOnly = true)
    public List<ReturnRequest> byVendor(String email) {
        User vendorUser = users.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return returns.findBySubOrder_Vendor_UserOrderByCreatedAtDesc(vendorUser);
    }

    @Transactional(readOnly = true)
    public List<ReturnRequest> all() {
        return returns.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public ReturnRequest updateStatus(UUID id, ReturnStatus status) {
        ReturnRequest result = returns.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Return request not found")
                );

        result.status = status;
        result.resolvedAt = LocalDateTime.now();

        if (status == ReturnStatus.APPROVED && (result.reverseAwb == null || result.reverseAwb.isEmpty())) {
            result.reverseAwb = "REV-SR-" + (System.currentTimeMillis() % 10000000);
        }

        if (status == ReturnStatus.REFUNDED && result.subOrder != null) {
            result.subOrder.status = OrderStatus.RETURNED;
            subOrders.save(result.subOrder);
            if (result.subOrder.order != null) {
                result.subOrder.order.status = OrderStatus.RETURNED;
                orders.save(result.subOrder.order);
            }
        }

        return returns.save(result);
    }

    @Transactional
    public ReturnRequest updateStatus(UUID id, ReturnStatus status, String comment, String email) {
        ReturnRequest result = returns.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Return request not found")
                );

        if (email != null) {
            User caller = users.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            if (caller.role != com.marketplace.entity.enums.Role.ADMIN) {
                if (result.subOrder != null && result.subOrder.vendor != null && result.subOrder.vendor.user != null) {
                    if (!result.subOrder.vendor.user.id.equals(caller.id)) {
                        throw new BusinessException("This return request does not belong to your vendor account");
                    }
                }
            }
        }

        result.status = status;
        if (comment != null && !comment.trim().isEmpty()) {
            result.vendorComment = comment.trim();
        }
        result.resolvedAt = LocalDateTime.now();

        if (status == ReturnStatus.APPROVED && (result.reverseAwb == null || result.reverseAwb.isEmpty())) {
            result.reverseAwb = "REV-SR-" + (System.currentTimeMillis() % 10000000);
        }

        if (status == ReturnStatus.REFUNDED && result.subOrder != null) {
            result.subOrder.status = OrderStatus.RETURNED;
            subOrders.save(result.subOrder);
            if (result.subOrder.order != null) {
                result.subOrder.order.status = OrderStatus.RETURNED;
                orders.save(result.subOrder.order);
            }
        }

        return returns.save(result);
    }
}
