//package com.marketplace.repository;
//
//import com.marketplace.entity.Order;
//import com.marketplace.entity.User;
//import org.springframework.data.jpa.repository.JpaRepository;
//
//import java.util.List;
//import java.util.UUID;
//
//public interface OrderRepository extends JpaRepository<Order, UUID> {
//    List<Order> findByBuyerOrderByCreatedAtDesc(User buyer);
//}
package com.marketplace.repository;

import com.marketplace.entity.Order;
import com.marketplace.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    List<Order> findByBuyerOrderByCreatedAtDesc(User buyer);

    List<Order> findAllByOrderByCreatedAtDesc();

    @Query("""
        SELECT DISTINCT o
        FROM Order o
        JOIN o.subOrders s
        WHERE s.vendor.id = :vendorId
        ORDER BY o.createdAt DESC
    """)
    List<Order> findByVendorId(@Param("vendorId") UUID vendorId);
}