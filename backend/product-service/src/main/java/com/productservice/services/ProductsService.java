package com.productservice.services;

import com.productservice.models.ProductDto;

import java.util.List;

public interface ProductsService {

    ProductDto create(ProductDto dto, String requesterRole, String businessCode);

    ProductDto update(ProductDto dto, String requesterRole, String businessCode);

    ProductDto getById(Integer id);

    List<ProductDto> getAll(String requesterRole, String businessCode);

    List<ProductDto> getByCategory(String category, String requesterRole, String businessCode);

    void delete(Integer id);
}
