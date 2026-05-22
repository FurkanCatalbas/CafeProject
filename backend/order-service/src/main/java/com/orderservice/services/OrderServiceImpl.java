package com.orderservice.services;

import com.orderservice.clients.PlaceServiceClient;
import com.orderservice.clients.ProductServiceClient;
import com.orderservice.kafka.OrderEventProducer;
import com.orderservice.mappers.OrderItemMapper;
import com.orderservice.mappers.OrderMapper;
import com.orderservice.models.DashboardSummaryDto;
import com.orderservice.models.OrderCreatedEvent;
import com.orderservice.models.OrderDto;
import com.orderservice.models.OrderEntity;
import com.orderservice.models.OrderItemDto;
import com.orderservice.models.OrderItemEntity;
import com.orderservice.repository.OrderRepository;
import com.wise.core.exceptions.ResourceNotFoundException;
import com.wise.core.enums.RecordStatusType;
import com.wise.core.enums.OrderStatus;
import com.wise.core.enums.PaymentMethod;
import com.wise.core.enums.PaymentStatus;
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
    private final PlaceServiceClient placeServiceClient;
    private final ProductServiceClient productServiceClient;

    @Override
    @Transactional
    public OrderDto create(OrderDto dto, Integer userId) {
        Integer resolvedUserId = userId == null ? 0 : userId;
        placeServiceClient.validatePlaceForOrder(dto.getPlaceId(), resolvedUserId, null);
        dto.setId(null);
        dto.setUserId(resolvedUserId);
        dto.setOrderDate(LocalDateTime.now());
        dto.setStatus(OrderStatus.ORDER_RECEIVED);
        dto.setPaymentStatus(PaymentStatus.UNPAID);

        DefaultValueSetterBaseDto.setDefaultValue(dto, RecordStatusType.CREATE, null);
        normalizeOrderItems(dto);

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
        event.setUserId(resolvedUserId);
        event.setPlaceId(entity.getPlaceId());
        event.setItems(dto.getOrderItems());
        orderEventProducer.sendOrderCreatedEvent(event);

        return toDto(entity);
    }

    @Override
    public OrderDto update(OrderDto dto) {
        getById(dto.getId());
        normalizeOrderItems(dto);

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
    public OrderDto updateStatus(Integer id, OrderStatus status) {
        OrderEntity entity = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Siparis bulunamadi: " + id));

        entity.setStatus(status);
        if (status == OrderStatus.PAID || status == OrderStatus.CANCELLED || status == OrderStatus.DELIVERED) {
            entity.setCompletedDate(LocalDateTime.now());
        }
        entity.setModifiedDate(LocalDateTime.now());
        entity.setUpdateseq(entity.getUpdateseq() == null ? 1 : entity.getUpdateseq() + 1);

        return toDto(orderRepository.save(entity));
    }

    @Override
    public OrderDto updatePaymentStatus(Integer id, PaymentStatus paymentStatus) {
        OrderEntity entity = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Siparis bulunamadi: " + id));

        entity.setPaymentStatus(paymentStatus);
        if (paymentStatus == PaymentStatus.PAID) {
            entity.setStatus(OrderStatus.PAID);
            entity.setCompletedDate(LocalDateTime.now());
        }
        entity.setModifiedDate(LocalDateTime.now());
        entity.setUpdateseq(entity.getUpdateseq() == null ? 1 : entity.getUpdateseq() + 1);

        return toDto(orderRepository.save(entity));
    }

    @Override
    @Transactional
    public OrderDto close(Integer id, PaymentMethod paymentMethod, Integer userId, String userRole) {
        OrderEntity entity = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Siparis bulunamadi: " + id));

        entity.setPaymentMethod(paymentMethod);
        entity.setPaymentStatus(PaymentStatus.PAID);
        entity.setStatus(OrderStatus.PAID);
        entity.setCompletedDate(LocalDateTime.now());
        entity.setModifiedDate(LocalDateTime.now());
        entity.setUpdateseq(entity.getUpdateseq() == null ? 1 : entity.getUpdateseq() + 1);

        OrderEntity savedEntity = orderRepository.save(entity);
        placeServiceClient.closePlace(savedEntity.getPlaceId(), userId, userRole);
        return toDto(savedEntity);
    }

    @Override
    public OrderDto getById(Integer id) {
        OrderEntity entity = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Siparis bulunamadi: " + id));
        return toDto(entity);
    }

    @Override
    public List<OrderDto> getByUserId(Integer userId) {
        return orderRepository.findByUserId(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDto> getActiveByPlaceId(Integer placeId) {
        List<OrderStatus> activeStatuses = getActiveStatuses();
        return orderRepository.findByPlaceIdAndStatusIn(placeId, activeStatuses).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDto> getActive() {
        return orderRepository.findByStatusIn(getActiveStatuses()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDto> getRecent() {
        return orderRepository.findTop10ByOrderByOrderDateDesc().stream()
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
    public DashboardSummaryDto getDashboardSummary() {
        List<OrderEntity> orders = orderRepository.findAll();
        List<OrderStatus> activeStatuses = getActiveStatuses();

        long activeOrderCount = orders.stream()
                .filter(order -> activeStatuses.contains(order.getStatus()))
                .count();
        long waitingPaymentCount = orders.stream()
                .filter(order -> order.getStatus() == OrderStatus.WAITING_PAYMENT)
                .count();
        long completedOrderCount = orders.stream()
                .filter(order -> order.getStatus() == OrderStatus.PAID)
                .count();
        BigDecimal totalRevenue = orders.stream()
                .filter(order -> order.getPaymentStatus() == PaymentStatus.PAID)
                .map(OrderEntity::getTotalAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        DashboardSummaryDto summary = new DashboardSummaryDto();
        summary.setActiveOrderCount(activeOrderCount);
        summary.setWaitingPaymentCount(waitingPaymentCount);
        summary.setCompletedOrderCount(completedOrderCount);
        summary.setTotalRevenue(totalRevenue);
        summary.setRecentOrders(getRecent());
        return summary;
    }

    @Override
    public void delete(Integer id) {
        getById(id);
        orderRepository.deleteById(id);
    }

    private OrderDto toDto(OrderEntity entity) {
        return OrderMapper.INSTANCE.toDto(entity);
    }

    private OrderEntity toEntity(OrderDto dto) {
        return OrderMapper.INSTANCE.toEntity(dto);
    }

    private List<OrderStatus> getActiveStatuses() {
        return List.of(
                OrderStatus.PENDING,
                OrderStatus.ORDER_RECEIVED,
                OrderStatus.PREPARING,
                OrderStatus.READY,
                OrderStatus.SERVED,
                OrderStatus.WAITING_PAYMENT
        );
    }

    private void normalizeOrderItems(OrderDto dto) {
        if (dto.getOrderItems() == null || dto.getOrderItems().isEmpty()) {
            return;
        }

        for (OrderItemDto item : dto.getOrderItems()) {
            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new com.wise.core.exceptions.BadRequestException("Urun adedi pozitif olmalidir.");
            }

            ProductServiceClient.ProductClientDto product = productServiceClient.getProductById(item.getProductId());
            item.setProductName(product.getName());
            item.setUnitPrice(product.getPrice());
            item.setTotalPrice(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }
    }
}
