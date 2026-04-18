package com.productservice.repository;

import com.productservice.models.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductsRepository extends JpaRepository<ProductEntity, Integer> {

    List<ProductEntity> findByIsActive(Boolean isActive);

    List<ProductEntity> findByCategory(String category);
}