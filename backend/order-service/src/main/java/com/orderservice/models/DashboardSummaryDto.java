package com.orderservice.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDto {
    private long activeOrderCount;
    private long waitingPaymentCount;
    private long completedOrderCount;
    private BigDecimal totalRevenue;
    private List<OrderDto> recentOrders;
}
