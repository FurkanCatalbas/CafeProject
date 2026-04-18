package com.orderservice.services;

import com.orderservice.kafka.OrderEventProducer;
import com.orderservice.mappers.OrderItemMapper;
import com.orderservice.mappers.OrderMapper;
import com.orderservice.models.OrderCreatedEvent;
import com.orderservice.models.OrderDto;
import com.orderservice.models.OrderEntity;
import com.orderservice.models.OrderItemDto;
import com.orderservice.models.OrderItemEntity;
import com.orderservice.repository.OrderRepository;
import com.wise.core.enums.RecordStatusType;
import com.wise.core.models.DefaultValueSetterBaseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderEventProducer orderEventProducer;

    @Override
    @Transactional
    public OrderDto create(OrderDto dto, Integer userId) {
        dto.setId(null);
        dto.setUserId(userId);
        dto.setOrderDate(LocalDateTime.now());
        dto.setStatus("PENDING");

        DefaultValueSetterBaseDto.setDefaultValue(dto, RecordStatusType.CREATE, null);

        if (dto.getOrderItems() != null && !dto.getOrderItems().isEmpty()) {
            BigDecimal totalAmount = BigDecimal.ZERO;
            for (OrderItemDto item : dto.getOrderItems()) {
                BigDecimal itemTotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                item.setTotalPrice(itemTotal);
                totalAmount = totalAmount.add(itemTotal);
            }
            dto.setTotalAmount(totalAmount);
        } else {
            dto.setTotalAmount(BigDecimal.ZERO);
        }

        OrderEntity entity = toEntity(dto);
        entity.setOrderItems(new ArrayList<>());

        if (dto.getOrderItems() != null) {
            for (OrderItemDto itemDto : dto.getOrderItems()) {
                OrderItemEntity itemEntity = OrderItemMapper.INSTANCE.toEntity(itemDto);
                itemEntity.setOrder(entity);
                entity.getOrderItems().add(itemEntity);
            }
        }

        entity = orderRepository.save(entity);
        dto.setId(entity.getId());

        OrderCreatedEvent event = new OrderCreatedEvent();
        event.setOrderId(entity.getId());
        event.setUserId(userId);
        event.setItems(dto.getOrderItems());
        orderEventProducer.sendOrderCreatedEvent(event);

        return toDto(entity);
    }

    @Override
    public OrderDto update(OrderDto dto) {
        if (getById(dto.getId()) == null) {
            return null;
        }

        if (dto.getOrderItems() != null && !dto.getOrderItems().isEmpty()) {
            BigDecimal totalAmount = BigDecimal.ZERO;
            for (OrderItemDto item : dto.getOrderItems()) {
                BigDecimal itemTotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                item.setTotalPrice(itemTotal);
                totalAmount = totalAmount.add(itemTotal);
            }
            dto.setTotalAmount(totalAmount);
        }

        DefaultValueSetterBaseDto.setDefaultValue(dto, RecordStatusType.UPDATE, null);
        OrderEntity entity = toEntity(dto);
        entity.setOrderItems(new ArrayList<>());

        if (dto.getOrderItems() != null) {
            for (OrderItemDto itemDto : dto.getOrderItems()) {
                OrderItemEntity itemEntity = OrderItemMapper.INSTANCE.toEntity(itemDto);
                itemEntity.setOrder(entity);
                entity.getOrderItems().add(itemEntity);
            }
        }

        entity = orderRepository.save(entity);
        return toDto(entity);
    }

    @Override
    public OrderDto getById(Integer id) {
        OrderEntity entity = orderRepository.findById(id).orElse(null);
        return toDto(entity);
    }

    @Override
    public List<OrderDto> getByUserId(Integer userId) {
        return orderRepository.findByUserId(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDto> getAll() {
        return orderRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(Integer id) {
        if (getById(id) == null) {
            return;
        }
        orderRepository.deleteById(id);
    }

    private OrderDto toDto(OrderEntity entity) {
        return OrderMapper.INSTANCE.toDto(entity);
    }

    private OrderEntity toEntity(OrderDto dto) {
        return OrderMapper.INSTANCE.toEntity(dto);
    }
}
