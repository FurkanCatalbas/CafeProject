package com.productservice.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreatedEvent {

    private Integer orderId;
    private Integer userId;
    private Integer placeId;
    private List<OrderItemEventDto> items;
}
