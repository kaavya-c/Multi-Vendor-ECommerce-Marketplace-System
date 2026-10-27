package com.marketplace.service;

import com.marketplace.entity.Dispute;
import com.marketplace.entity.Order;
import com.marketplace.entity.User;
import com.marketplace.exception.ResourceNotFoundException;
import com.marketplace.repository.DisputeRepository;
import com.marketplace.repository.OrderRepository;
import com.marketplace.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class DisputeService {
    private final DisputeRepository disputes;
    private final UserRepository users;
    private final OrderRepository orders;

    public DisputeService(DisputeRepository disputes, UserRepository users, OrderRepository orders) {
        this.disputes = disputes;
        this.users = users;
        this.orders = orders;
    }

    public Dispute create(UUID orderId, String type, String description, String email) {
        User buyer = users.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Order order = orders.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        Dispute dispute = new Dispute();
        dispute.buyer = buyer;
        dispute.order = order;
        dispute.type = type;
        dispute.description = description;
        return disputes.save(dispute);
    }

    public List<Dispute> all() {
        return disputes.findAllByOrderByCreatedAtDesc();
    }

    public Dispute resolve(UUID id, String resolution) {
        Dispute dispute = disputes.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute not found"));
        dispute.resolution = resolution;
        dispute.status = "RESOLVED";
        return disputes.save(dispute);
    }
}
