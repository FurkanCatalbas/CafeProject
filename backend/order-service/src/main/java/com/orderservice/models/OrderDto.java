package com.orderservice.models;

import com.wise.core.enums.OrderStatus;
import com.wise.core.enums.PaymentMethod;
import com.wise.core.enums.PaymentStatus;
import com.wise.core.models.BaseDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto extends BaseDto {
    private Integer userId;
    private Integer placeId;
    private LocalDateTime orderDate;
    private LocalDateTime completedDate;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private PaymentMethod paymentMethod;
    private String note;
    private List<OrderItemDto> orderItems;
}
