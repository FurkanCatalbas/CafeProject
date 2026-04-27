package com.productservice.services;

import com.productservice.mappers.ProductMapper;
import com.productservice.models.ProductDto;
import com.productservice.models.ProductEntity;
import com.productservice.repository.ProductsRepository;
import com.wise.core.enums.RecordStatusType;
import com.wise.core.exceptions.ResourceNotFoundException;
import com.wise.core.models.DefaultValueSetterBaseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductsServiceImpl implements ProductsService {

    private final ProductsRepository productsRepository;

    @Override
    public ProductDto create(ProductDto dto) {
        dto.setId(null);
        return saveOrUpdate(RecordStatusType.CREATE, dto);
    }

    @Override
    public ProductDto update(ProductDto dto) {
        getById(dto.getId());
        return saveOrUpdate(RecordStatusType.UPDATE, dto);
    }

    private ProductDto saveOrUpdate(RecordStatusType recordStatusType, ProductDto dto) {
        if (recordStatusType == RecordStatusType.CREATE) {
            DefaultValueSetterBaseDto.setDefaultValue(dto, RecordStatusType.CREATE, null);
        } else if (recordStatusType == RecordStatusType.UPDATE) {
            DefaultValueSetterBaseDto.setDefaultValue(dto, RecordStatusType.UPDATE, null);
        }

        ProductEntity entity = productsRepository.save(toEntity(dto));
        dto.setId(entity.getId());

        return toDto(entity);
    }

    @Override
    public ProductDto getById(Integer id) {
        ProductEntity entity = productsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Urun bulunamadi: " + id));
        return toDto(entity);
    }

    @Override
    public List<ProductDto> getAll() {
        return productsRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductDto> getByCategory(String category) {
        return productsRepository.findByCategory(category).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(Integer id) {
        getById(id);
        productsRepository.deleteById(id);
    }

    private ProductDto toDto(ProductEntity entity) {
        return ProductMapper.INSTANCE.toDto(entity);
    }

    private ProductEntity toEntity(ProductDto dto) {
        return ProductMapper.INSTANCE.toEntity(dto);
    }
}
