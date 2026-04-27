package com.orderservice.models;

import com.wise.core.enums.OrderStatus;
import com.wise.core.enums.PaymentMethod;
import com.wise.core.enums.PaymentStatus;
import com.wise.core.models.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ORDERS")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class OrderEntity extends BaseEntity {

    @Column(name = "USER_ID", nullable = false)
    private Integer userId;

    @Column(name = "PLACE_ID")
    private Integer placeId;

    @Column(name = "ORDER_DATE", nullable = false)
    private LocalDateTime orderDate;

    @Column(name = "COMPLETED_DATE")
    private LocalDateTime completedDate;

    @Column(name = "TOTAL_AMOUNT", nullable = false)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", length = 50)
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "PAYMENT_STATUS", length = 50)
    private PaymentStatus paymentStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "PAYMENT_METHOD", length = 50)
    private PaymentMethod paymentMethod;

    @Column(name = "NOTE")
    private String note;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItemEntity> orderItems = new ArrayList<>();
}
