package com.productservice.services;

import com.productservice.models.ProductDto;

import java.util.List;

public interface ProductsService {

    ProductDto create(ProductDto dto);

    ProductDto update(ProductDto dto);

    ProductDto getById(Integer id);

    List<ProductDto> getAll();

    List<ProductDto> getByCategory(String category);

    void delete(Integer id);
}