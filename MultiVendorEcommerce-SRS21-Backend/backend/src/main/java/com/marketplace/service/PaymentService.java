package com.marketplace.service;

import com.marketplace.entity.Order;
import com.marketplace.entity.Payment;
import com.marketplace.entity.enums.PaymentStatus;
import com.marketplace.exception.BusinessException;
import com.marketplace.exception.ResourceNotFoundException;
import com.marketplace.repository.OrderRepository;
import com.marketplace.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PaymentService {
    private final PaymentRepository payments;
    private final OrderRepository orders;

    public PaymentService(PaymentRepository payments, OrderRepository orders) {
        this.payments = payments;
        this.orders = orders;
    }

    public Payment capture(UUID orderId, String email) {
        Order order = orders.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.buyer.email.equals(email)) {
            throw new BusinessException("You can pay only for your own order");
        }

        Payment payment = payments.findByOrder(order).orElseGet(Payment::new);
        payment.order = order;
        payment.amount = order.totalAmount;
        payment.status = PaymentStatus.PAID;
        payment.transactionId = "MOCK-" + UUID.randomUUID();
        payment.paidAt = LocalDateTime.now();

        order.paymentStatus = PaymentStatus.PAID;
        order.paymentTransactionId = payment.transactionId;
        orders.save(order);
        return payments.save(payment);
    }

    public Payment get(UUID id, String email) {
        Payment payment = payments.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        if (!payment.order.buyer.email.equals(email)) {
            throw new BusinessException("Payment does not belong to the logged-in user");
        }
        return payment;
    }
}
