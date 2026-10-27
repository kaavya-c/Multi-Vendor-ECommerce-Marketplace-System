//package com.marketplace.repository;
//
//import com.marketplace.entity.ReturnRequest;
//import com.marketplace.entity.User;
//import org.springframework.data.jpa.repository.JpaRepository;
//
//import java.util.List;
//import java.util.UUID;
//
//public interface ReturnRepository extends JpaRepository<ReturnRequest, UUID> {
//    List<ReturnRequest> findByBuyerOrderByCreatedAtDesc(User buyer);
//}

package com.marketplace.repository;

import com.marketplace.entity.ReturnRequest;
import com.marketplace.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReturnRepository extends JpaRepository<ReturnRequest, UUID> {

    List<ReturnRequest> findByBuyerOrderByCreatedAtDesc(User buyer);

    List<ReturnRequest> findBySubOrder_Vendor_UserOrderByCreatedAtDesc(User user);

    List<ReturnRequest> findBySubOrder_Id(UUID subOrderId);

    List<ReturnRequest> findAllByOrderByCreatedAtDesc();
}
