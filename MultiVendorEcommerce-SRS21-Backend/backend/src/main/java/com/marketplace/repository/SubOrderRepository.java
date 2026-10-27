//package com.marketplace.repository;
//
//public class SubOrderRepository {
//}

package com.marketplace.repository;

import com.marketplace.entity.SubOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubOrderRepository extends JpaRepository<SubOrder, UUID> {

    List<SubOrder> findByVendorIdOrderByIdDesc(UUID vendorId);

    Optional<SubOrder> findByAwbNumber(String awbNumber);
}