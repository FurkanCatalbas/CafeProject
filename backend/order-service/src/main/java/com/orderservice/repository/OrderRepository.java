package com.orderservice.repository;

import com.orderservice.models.OrderEntity;
import com.wise.core.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Integer> {

    List<OrderEntity> findByUserId(Integer userId);

    List<OrderEntity> findByStatus(OrderStatus status);

    List<OrderEntity> findByPlaceIdAndStatusIn(Integer placeId, List<OrderStatus> statuses);

    List<OrderEntity> findByStatusIn(List<OrderStatus> statuses);

    List<OrderEntity> findTop10ByOrderByOrderDateDesc();
}
