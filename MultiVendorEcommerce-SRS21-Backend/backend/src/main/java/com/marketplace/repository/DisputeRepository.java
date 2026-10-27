package com.marketplace.repository;

import com.marketplace.entity.Dispute;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DisputeRepository extends JpaRepository<Dispute, UUID> {
    List<Dispute> findAllByOrderByCreatedAtDesc();
}
