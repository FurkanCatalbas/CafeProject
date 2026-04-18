package com.orderservice.mappers;

import com.orderservice.models.OrderDto;
import com.orderservice.models.OrderEntity;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    OrderMapper INSTANCE = Mappers.getMapper(OrderMapper.class);

    OrderDto toDto(OrderEntity entity);

    OrderEntity toEntity(OrderDto dto);

    List<OrderDto> toDtos(List<OrderEntity> entities);
}