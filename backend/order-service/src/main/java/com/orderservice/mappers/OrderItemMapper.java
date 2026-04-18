package com.orderservice.mappers;

import com.orderservice.models.OrderItemDto;
import com.orderservice.models.OrderItemEntity;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderItemMapper {

    OrderItemMapper INSTANCE = Mappers.getMapper(OrderItemMapper.class);

    OrderItemDto toDto(OrderItemEntity entity);

    OrderItemEntity toEntity(OrderItemDto dto);

    List<OrderItemDto> toDtos(List<OrderItemEntity> entities);
}