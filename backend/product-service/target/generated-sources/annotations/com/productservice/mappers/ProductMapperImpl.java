package com.productservice.mappers;

import com.productservice.models.ProductDto;
import com.productservice.models.ProductEntity;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-18T23:23:06+0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.8 (Oracle Corporation)"
)
@Component
public class ProductMapperImpl implements ProductMapper {

    @Override
    public ProductDto toDto(ProductEntity entity) {
        if ( entity == null ) {
            return null;
        }

        ProductDto productDto = new ProductDto();

        productDto.setId( entity.getId() );
        productDto.setCreateDate( entity.getCreateDate() );
        productDto.setCreateFkUser( entity.getCreateFkUser() );
        productDto.setModifiedDate( entity.getModifiedDate() );
        productDto.setModifiedFkUser( entity.getModifiedFkUser() );
        productDto.setUpdateseq( entity.getUpdateseq() );
        if ( entity.getUuid() != null ) {
            productDto.setUuid( entity.getUuid().toString() );
        }
        productDto.setName( entity.getName() );
        productDto.setDescription( entity.getDescription() );
        productDto.setPrice( entity.getPrice() );
        productDto.setStock( entity.getStock() );
        productDto.setCategory( entity.getCategory() );
        productDto.setImageUrl( entity.getImageUrl() );
        productDto.setIsActive( entity.getIsActive() );

        return productDto;
    }

    @Override
    public ProductEntity toEntity(ProductDto dto) {
        if ( dto == null ) {
            return null;
        }

        ProductEntity productEntity = new ProductEntity();

        productEntity.setId( dto.getId() );
        if ( dto.getUuid() != null ) {
            productEntity.setUuid( UUID.fromString( dto.getUuid() ) );
        }
        productEntity.setCreateDate( dto.getCreateDate() );
        productEntity.setCreateFkUser( dto.getCreateFkUser() );
        productEntity.setModifiedDate( dto.getModifiedDate() );
        productEntity.setModifiedFkUser( dto.getModifiedFkUser() );
        productEntity.setUpdateseq( dto.getUpdateseq() );
        productEntity.setName( dto.getName() );
        productEntity.setDescription( dto.getDescription() );
        productEntity.setPrice( dto.getPrice() );
        productEntity.setStock( dto.getStock() );
        productEntity.setCategory( dto.getCategory() );
        productEntity.setImageUrl( dto.getImageUrl() );
        productEntity.setIsActive( dto.getIsActive() );

        return productEntity;
    }

    @Override
    public List<ProductDto> toDtos(List<ProductEntity> entities) {
        if ( entities == null ) {
            return null;
        }

        List<ProductDto> list = new ArrayList<ProductDto>( entities.size() );
        for ( ProductEntity productEntity : entities ) {
            list.add( toDto( productEntity ) );
        }

        return list;
    }
}
