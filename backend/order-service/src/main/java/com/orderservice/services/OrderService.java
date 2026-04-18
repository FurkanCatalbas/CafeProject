package com.orderservice.services;

import com.orderservice.models.OrderDto;

import java.util.List;

public interface OrderService {

    OrderDto create(OrderDto dto, Integer userId);

    OrderDto update(OrderDto dto);

    OrderDto getById(Integer id);

    List<OrderDto> getByUserId(Integer userId);

    List<OrderDto> getAll();

    void delete(Integer id);
}