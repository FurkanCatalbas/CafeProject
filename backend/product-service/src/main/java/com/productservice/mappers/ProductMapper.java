package com.productservice.mappers;

import com.productservice.models.ProductDto;
import com.productservice.models.ProductEntity;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    ProductMapper INSTANCE = Mappers.getMapper(ProductMapper.class);

    ProductDto toDto(ProductEntity entity);

    ProductEntity toEntity(ProductDto dto);

    List<ProductDto> toDtos(List<ProductEntity> entities);
}