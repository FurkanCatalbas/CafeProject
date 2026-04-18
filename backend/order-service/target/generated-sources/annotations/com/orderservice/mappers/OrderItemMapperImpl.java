package com.orderservice.mappers;

import com.orderservice.models.OrderItemDto;
import com.orderservice.models.OrderItemEntity;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-18T23:47:18+0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.8 (Oracle Corporation)"
)
@Component
public class OrderItemMapperImpl implements OrderItemMapper {

    @Override
    public OrderItemDto toDto(OrderItemEntity entity) {
        if ( entity == null ) {
            return null;
        }

        OrderItemDto orderItemDto = new OrderItemDto();

        orderItemDto.setId( entity.getId() );
        orderItemDto.setProductId( entity.getProductId() );
        orderItemDto.setProductName( entity.getProductName() );
        orderItemDto.setQuantity( entity.getQuantity() );
        orderItemDto.setUnitPrice( entity.getUnitPrice() );
        orderItemDto.setTotalPrice( entity.getTotalPrice() );

        return orderItemDto;
    }

    @Override
    public OrderItemEntity toEntity(OrderItemDto dto) {
        if ( dto == null ) {
            return null;
        }

        OrderItemEntity orderItemEntity = new OrderItemEntity();

        orderItemEntity.setId( dto.getId() );
        orderItemEntity.setProductId( dto.getProductId() );
        orderItemEntity.setProductName( dto.getProductName() );
        orderItemEntity.setQuantity( dto.getQuantity() );
        orderItemEntity.setUnitPrice( dto.getUnitPrice() );
        orderItemEntity.setTotalPrice( dto.getTotalPrice() );

        return orderItemEntity;
    }

    @Override
    public List<OrderItemDto> toDtos(List<OrderItemEntity> entities) {
        if ( entities == null ) {
            return null;
        }

        List<OrderItemDto> list = new ArrayList<OrderItemDto>( entities.size() );
        for ( OrderItemEntity orderItemEntity : entities ) {
            list.add( toDto( orderItemEntity ) );
        }

        return list;
    }
}
