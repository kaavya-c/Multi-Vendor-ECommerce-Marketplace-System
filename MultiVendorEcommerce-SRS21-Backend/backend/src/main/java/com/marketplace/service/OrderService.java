//package com.marketplace.service;
//
//import com.marketplace.dto.CheckoutRequest;
//import com.marketplace.entity.CartItem;
//import com.marketplace.entity.Order;
//import com.marketplace.entity.OrderItem;
//import com.marketplace.entity.SubOrder;
//import com.marketplace.entity.User;
//import com.marketplace.entity.Vendor;
//import com.marketplace.entity.enums.OrderStatus;
//import com.marketplace.entity.enums.PaymentStatus;
//import com.marketplace.exception.BusinessException;
//import com.marketplace.exception.ResourceNotFoundException;
//import com.marketplace.repository.CartItemRepository;
//import com.marketplace.repository.OrderRepository;
//import com.marketplace.repository.UserRepository;
//import com.marketplace.repository.VendorRepository;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//import java.util.UUID;
//
//@Service
//public class OrderService {
//    private final OrderRepository orders;
//    private final CartItemRepository carts;
//    private final UserRepository users;
//    private final VendorRepository vendors;
//
//    public OrderService(OrderRepository orders,
//                        CartItemRepository carts,
//                        UserRepository users,
//                        VendorRepository vendors) {
//        this.orders = orders;
//        this.carts = carts;
//        this.users = users;
//        this.vendors = vendors;
//    }
//
//    @Transactional
//    public Order checkout(String email, CheckoutRequest request) {
//        User buyer = user(email);
//        List<CartItem> cart = carts.findByBuyer(buyer);
//        if (cart.isEmpty()) {
//            throw new BusinessException("Cart is empty");
//        }
//
//        Order order = new Order();
//        order.buyer = buyer;
//        order.shippingAddress = request.shippingAddress;
//        order.paymentMethod = request.paymentMethod;
//        order.paymentStatus = PaymentStatus.PENDING;
//        order.status = OrderStatus.PLACED;
//
//        Map<UUID, SubOrder> subOrders = new HashMap<>();
//        double total = 0;
//
//        for (CartItem cartItem : cart) {
//            if (cartItem.variant.stockQuantity < cartItem.quantity) {
//                throw new BusinessException("Insufficient stock for SKU " + cartItem.variant.sku);
//            }
//
//            Vendor vendor = cartItem.variant.product.vendor;
//            SubOrder subOrder = subOrders.get(vendor.id);
//            if (subOrder == null) {
//                subOrder = new SubOrder();
//                subOrder.order = order;
//                subOrder.vendor = vendor;
//                subOrders.put(vendor.id, subOrder);
//                order.subOrders.add(subOrder);
//            }
//
//            OrderItem item = new OrderItem();
//            item.order = order;
//            item.variant = cartItem.variant;
//            item.quantity = cartItem.quantity;
//            item.unitPrice = cartItem.variant.price;
//            item.vendorId = vendor.id;
//            item.commissionAmount = item.unitPrice * item.quantity * 0.10;
//            item.payoutAmount = item.unitPrice * item.quantity - item.commissionAmount;
//            order.items.add(item);
//
//            cartItem.variant.stockQuantity -= cartItem.quantity;
//            total += item.unitPrice * item.quantity;
//        }
//
//        order.totalAmount = total;
//        Order saved = orders.save(order);
//        carts.deleteAll(cart);
//        return saved;
//    }
//
//    @Transactional(readOnly = true)
//    public List<Order> byUser(String email) {
//        return orders.findByBuyerOrderByCreatedAtDesc(user(email));
//    }
//
//    @Transactional(readOnly = true)
//    public List<Order> vendorOrders(String email) {
//        Vendor vendor = vendors.findByUser(user(email))
//                .orElseThrow(() -> new BusinessException("Vendor profile not found"));
//
//        return orders.findByVendorId(vendor.id);
//    }
//
//    public Order get(UUID id, String email) {
//        Order order = orders.findById(id)
//                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
//        if (!order.buyer.email.equals(email)) {
//            throw new BusinessException("Order does not belong to the logged-in user");
//        }
//        return order;
//    }
//
//    @Transactional
//    public Order updateStatus(UUID id, OrderStatus status, String email) {
//        Order order = orders.findById(id)
//                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
//        Vendor vendor = vendors.findByUser(user(email))
//                .orElseThrow(() -> new BusinessException("Vendor profile not found"));
//        boolean owns = order.subOrders.stream().anyMatch(s -> s.vendor.id.equals(vendor.id));
//        if (!owns) {
//            throw new BusinessException("This order does not belong to your vendor account");
//        }
//        order.status = status;
//        order.subOrders.stream()
//                .filter(s -> s.vendor.id.equals(vendor.id))
//                .forEach(s -> s.status = status);
//        return orders.save(order);
//    }
//
//    private User user(String email) {
//        return users.findByEmail(email)
//                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
//    }
//}

package com.marketplace.service;

import com.marketplace.dto.CheckoutRequest;
import com.marketplace.entity.CartItem;
import com.marketplace.entity.Order;
import com.marketplace.entity.OrderItem;
import com.marketplace.entity.SubOrder;
import com.marketplace.entity.User;
import com.marketplace.entity.Vendor;
import com.marketplace.entity.enums.OrderStatus;
import com.marketplace.entity.enums.PaymentStatus;
import com.marketplace.exception.BusinessException;
import com.marketplace.exception.ResourceNotFoundException;
import com.marketplace.repository.CartItemRepository;
import com.marketplace.repository.OrderRepository;
import com.marketplace.repository.SubOrderRepository;
import com.marketplace.repository.UserRepository;
import com.marketplace.repository.VendorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orders;
    private final CartItemRepository carts;
    private final UserRepository users;
    private final VendorRepository vendors;
    private final SubOrderRepository subOrders;

    public OrderService(OrderRepository orders,
                        CartItemRepository carts,
                        UserRepository users,
                        VendorRepository vendors,
                        SubOrderRepository subOrders) {
        this.orders = orders;
        this.carts = carts;
        this.users = users;
        this.vendors = vendors;
        this.subOrders = subOrders;
    }

    @Transactional
    public Order checkout(String email, CheckoutRequest request) {
        User buyer = user(email);
        if (buyer.role != com.marketplace.entity.enums.Role.BUYER) {
            throw new BusinessException("Only buyers can place orders");
        }
        List<CartItem> cart = carts.findByBuyer(buyer);

        if (cart.isEmpty()) {
            throw new BusinessException("Cart is empty");
        }

        Order order = new Order();
        order.buyer = buyer;
        order.shippingAddress = request.shippingAddress;
        order.paymentMethod = request.paymentMethod;
        order.paymentStatus = PaymentStatus.PENDING;
        order.status = OrderStatus.PLACED;

        Map<UUID, SubOrder> subOrders = new HashMap<>();
        double total = 0;

        for (CartItem cartItem : cart) {

            if (cartItem.variant.stockQuantity < cartItem.quantity) {
                throw new BusinessException(
                        "Insufficient stock for SKU " + cartItem.variant.sku
                );
            }

            Vendor vendor = cartItem.variant.product.vendor;

            SubOrder subOrder = subOrders.get(vendor.id);

            if (subOrder == null) {
                subOrder = new SubOrder();
                subOrder.order = order;
                subOrder.vendor = vendor;

                subOrders.put(vendor.id, subOrder);
                order.subOrders.add(subOrder);
            }

            OrderItem item = new OrderItem();
            item.order = order;
            item.variant = cartItem.variant;
            item.quantity = cartItem.quantity;
            item.unitPrice = cartItem.variant.price;
            item.vendorId = vendor.id;

            item.commissionAmount =
                    item.unitPrice * item.quantity * 0.10;

            item.payoutAmount =
                    item.unitPrice * item.quantity
                            - item.commissionAmount;

            order.items.add(item);

            cartItem.variant.stockQuantity -= cartItem.quantity;

            total += item.unitPrice * item.quantity;
        }

        order.totalAmount = total;

        Order saved = orders.save(order);

        carts.deleteAll(cart);

        return saved;
    }

    @Transactional(readOnly = true)
    public List<Order> byUser(String email) {
        return orders.findByBuyerOrderByCreatedAtDesc(user(email));
    }

    @Transactional(readOnly = true)
    public List<Order> allOrders() {
        return orders.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<Order> vendorOrders(String email) {
        Vendor vendor = vendors.findByUser(user(email))
                .orElseThrow(() ->
                        new BusinessException("Vendor profile not found"));

        return orders.findByVendorId(vendor.id);
    }

    public Order get(UUID id, String email) {
        Order order = orders.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Order not found"));

        if (!order.buyer.email.equals(email)) {
            throw new BusinessException(
                    "Order does not belong to the logged-in user"
            );
        }

        return order;
    }

    @Transactional
    public Order updateStatus(UUID id,
                              OrderStatus status,
                              String email) {

        Order order = orders.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Order not found"));

        Vendor vendor = vendors.findByUser(user(email))
                .orElseThrow(() ->
                        new BusinessException("Vendor profile not found"));

        boolean owns = order.subOrders.stream()
                .anyMatch(s -> s.vendor.id.equals(vendor.id));

        if (!owns) {
            throw new BusinessException(
                    "This order does not belong to your vendor account"
            );
        }

        order.status = status;

        order.subOrders.stream()
                .filter(s -> s.vendor.id.equals(vendor.id))
                .forEach(s -> s.status = status);

        return orders.save(order);
    }

    @Transactional
    public SubOrder updateSubOrderStatus(UUID subOrderId,
                                         OrderStatus status,
                                         String email) {

        SubOrder subOrder = subOrders.findById(subOrderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Sub-order not found"));

        Vendor vendor = vendors.findByUser(user(email))
                .orElseThrow(() ->
                        new BusinessException("Vendor profile not found"));

        if (!subOrder.vendor.id.equals(vendor.id)) {
            throw new BusinessException(
                    "This sub-order does not belong to your vendor account"
            );
        }
        if (status == OrderStatus.DISPATCHED &&
                (subOrder.awbNumber == null || subOrder.awbNumber.trim().isEmpty())) {
            throw new BusinessException("AWB number is required before dispatch");
        }
        subOrder.status = status;

        if (status == OrderStatus.DISPATCHED) {
            subOrder.dispatchedAt = java.time.LocalDateTime.now();
        }

        if (status == OrderStatus.DELIVERED) {
            subOrder.deliveredAt = java.time.LocalDateTime.now();
        }

        SubOrder saved = subOrders.save(subOrder);
        syncOrderStatus(subOrder.order);
        return saved;
    }

    @Transactional
    public SubOrder updateAwb(UUID subOrderId, String awbNumber, String email) {

        SubOrder subOrder = subOrders.findById(subOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sub-order not found"));

        Vendor vendor = vendors.findByUser(user(email))
                .orElseThrow(() -> new BusinessException("Vendor profile not found"));

        if (!subOrder.vendor.id.equals(vendor.id)) {
            throw new BusinessException(
                    "This sub-order does not belong to your vendor account"
            );
        }

        if (awbNumber == null || awbNumber.trim().isEmpty()) {
            throw new BusinessException("AWB number cannot be empty");
        }

        subOrder.awbNumber = awbNumber.trim();

        return subOrders.save(subOrder);
    }

    @Transactional
    public SubOrder cancelSubOrder(UUID subOrderId, String email) {

        SubOrder subOrder = subOrders.findById(subOrderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Sub-order not found"));

        // Find the logged-in buyer
        User buyer = user(email);

        // Make sure this sub-order belongs to the buyer's order
        if (!subOrder.order.buyer.id.equals(buyer.id)) {
            throw new BusinessException(
                    "This sub-order does not belong to your account"
            );
        }

        // Cancellation is allowed only before dispatch
        if (subOrder.status == OrderStatus.DISPATCHED ||
                subOrder.status == OrderStatus.DELIVERED ||
                subOrder.status == OrderStatus.RETURNED) {

            throw new BusinessException(
                    "This order cannot be cancelled at its current status"
            );
        }

        subOrder.status = OrderStatus.CANCELLED;

        SubOrder saved = subOrders.save(subOrder);
        syncOrderStatus(subOrder.order);
        return saved;
    }

    public void syncOrderStatus(Order order) {
        if (order == null || order.subOrders == null || order.subOrders.isEmpty()) {
            return;
        }
        boolean allDelivered = order.subOrders.stream().allMatch(s -> s.status == OrderStatus.DELIVERED);
        boolean allReturned = order.subOrders.stream().allMatch(s -> s.status == OrderStatus.RETURNED);
        boolean allCancelled = order.subOrders.stream().allMatch(s -> s.status == OrderStatus.CANCELLED);
        boolean anyDispatched = order.subOrders.stream().anyMatch(s -> s.status == OrderStatus.DISPATCHED);
        boolean anyPacked = order.subOrders.stream().anyMatch(s -> s.status == OrderStatus.PACKED);
        boolean anyConfirmed = order.subOrders.stream().anyMatch(s -> s.status == OrderStatus.CONFIRMED);

        if (allReturned) {
            order.status = OrderStatus.RETURNED;
        } else if (allDelivered) {
            order.status = OrderStatus.DELIVERED;
        } else if (allCancelled) {
            order.status = OrderStatus.CANCELLED;
        } else if (anyDispatched) {
            order.status = OrderStatus.DISPATCHED;
        } else if (anyPacked) {
            order.status = OrderStatus.PACKED;
        } else if (anyConfirmed) {
            order.status = OrderStatus.CONFIRMED;
        }
        orders.save(order);
    }

    private User user(String email) {
        return users.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));
    }
}