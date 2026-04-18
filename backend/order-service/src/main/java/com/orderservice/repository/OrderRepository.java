package com.orderservice.repository;

import com.orderservice.models.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Integer> {

    List<OrderEntity> findByUserId(Integer userId);

    List<OrderEntity> findByStatus(String status);
}