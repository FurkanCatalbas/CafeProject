package com.orderservice.services;

import com.orderservice.models.DashboardSummaryDto;
import com.orderservice.models.OrderDto;
import com.wise.core.enums.OrderStatus;
import com.wise.core.enums.PaymentMethod;
import com.wise.core.enums.PaymentStatus;

import java.util.List;

public interface OrderService {

    OrderDto create(OrderDto dto, Integer userId);

    OrderDto update(OrderDto dto);

    OrderDto updateStatus(Integer id, OrderStatus status);

    OrderDto updatePaymentStatus(Integer id, PaymentStatus paymentStatus);

    OrderDto close(Integer id, PaymentMethod paymentMethod, Integer userId, String userRole);

    OrderDto getById(Integer id);

    List<OrderDto> getByUserId(Integer userId);

    List<OrderDto> getActiveByPlaceId(Integer placeId);

    List<OrderDto> getActive();

    List<OrderDto> getRecent();

    List<OrderDto> getAll();

    DashboardSummaryDto getDashboardSummary();

    void delete(Integer id);
}
