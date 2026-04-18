package com.orderservice.mappers;

import com.orderservice.models.OrderDto;
import com.orderservice.models.OrderEntity;
import com.orderservice.models.OrderItemDto;
import com.orderservice.models.OrderItemEntity;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-18T23:47:18+0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.8 (Oracle Corporation)"
)
@Component
public class OrderMapperImpl implements OrderMapper {

    @Override
    public OrderDto toDto(OrderEntity entity) {
        if ( entity == null ) {
            return null;
        }

        OrderDto orderDto = new OrderDto();

        orderDto.setId( entity.getId() );
        orderDto.setCreateDate( entity.getCreateDate() );
        orderDto.setCreateFkUser( entity.getCreateFkUser() );
        orderDto.setModifiedDate( entity.getModifiedDate() );
        orderDto.setModifiedFkUser( entity.getModifiedFkUser() );
        orderDto.setUpdateseq( entity.getUpdateseq() );
        if ( entity.getUuid() != null ) {
            orderDto.setUuid( entity.getUuid().toString() );
        }
        orderDto.setUserId( entity.getUserId() );
        orderDto.setOrderDate( entity.getOrderDate() );
        orderDto.setTotalAmount( entity.getTotalAmount() );
        orderDto.setStatus( entity.getStatus() );
        orderDto.setNote( entity.getNote() );
        orderDto.setOrderItems( orderItemEntityListToOrderItemDtoList( entity.getOrderItems() ) );

        return orderDto;
    }

    @Override
    public OrderEntity toEntity(OrderDto dto) {
        if ( dto == null ) {
            return null;
        }

        OrderEntity orderEntity = new OrderEntity();

        orderEntity.setId( dto.getId() );
        if ( dto.getUuid() != null ) {
            orderEntity.setUuid( UUID.fromString( dto.getUuid() ) );
        }
        orderEntity.setCreateDate( dto.getCreateDate() );
        orderEntity.setCreateFkUser( dto.getCreateFkUser() );
        orderEntity.setModifiedDate( dto.getModifiedDate() );
        orderEntity.setModifiedFkUser( dto.getModifiedFkUser() );
        orderEntity.setUpdateseq( dto.getUpdateseq() );
        orderEntity.setUserId( dto.getUserId() );
        orderEntity.setOrderDate( dto.getOrderDate() );
        orderEntity.setTotalAmount( dto.getTotalAmount() );
        orderEntity.setStatus( dto.getStatus() );
        orderEntity.setNote( dto.getNote() );
        orderEntity.setOrderItems( orderItemDtoListToOrderItemEntityList( dto.getOrderItems() ) );

        return orderEntity;
    }

    @Override
    public List<OrderDto> toDtos(List<OrderEntity> entities) {
        if ( entities == null ) {
            return null;
        }

        List<OrderDto> list = new ArrayList<OrderDto>( entities.size() );
        for ( OrderEntity orderEntity : entities ) {
            list.add( toDto( orderEntity ) );
        }

        return list;
    }

    protected OrderItemDto orderItemEntityToOrderItemDto(OrderItemEntity orderItemEntity) {
        if ( orderItemEntity == null ) {
            return null;
        }

        OrderItemDto orderItemDto = new OrderItemDto();

        orderItemDto.setId( orderItemEntity.getId() );
        orderItemDto.setProductId( orderItemEntity.getProductId() );
        orderItemDto.setProductName( orderItemEntity.getProductName() );
        orderItemDto.setQuantity( orderItemEntity.getQuantity() );
        orderItemDto.setUnitPrice( orderItemEntity.getUnitPrice() );
        orderItemDto.setTotalPrice( orderItemEntity.getTotalPrice() );

        return orderItemDto;
    }

    protected List<OrderItemDto> orderItemEntityListToOrderItemDtoList(List<OrderItemEntity> list) {
        if ( list == null ) {
            return null;
        }

        List<OrderItemDto> list1 = new ArrayList<OrderItemDto>( list.size() );
        for ( OrderItemEntity orderItemEntity : list ) {
            list1.add( orderItemEntityToOrderItemDto( orderItemEntity ) );
        }

        return list1;
    }

    protected OrderItemEntity orderItemDtoToOrderItemEntity(OrderItemDto orderItemDto) {
        if ( orderItemDto == null ) {
            return null;
        }

        OrderItemEntity orderItemEntity = new OrderItemEntity();

        orderItemEntity.setId( orderItemDto.getId() );
        orderItemEntity.setProductId( orderItemDto.getProductId() );
        orderItemEntity.setProductName( orderItemDto.getProductName() );
        orderItemEntity.setQuantity( orderItemDto.getQuantity() );
        orderItemEntity.setUnitPrice( orderItemDto.getUnitPrice() );
        orderItemEntity.setTotalPrice( orderItemDto.getTotalPrice() );

        return orderItemEntity;
    }

    protected List<OrderItemEntity> orderItemDtoListToOrderItemEntityList(List<OrderItemDto> list) {
        if ( list == null ) {
            return null;
        }

        List<OrderItemEntity> list1 = new ArrayList<OrderItemEntity>( list.size() );
        for ( OrderItemDto orderItemDto : list ) {
            list1.add( orderItemDtoToOrderItemEntity( orderItemDto ) );
        }

        return list1;
    }
}
