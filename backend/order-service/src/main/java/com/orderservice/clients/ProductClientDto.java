package com.orderservice.clients;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductClientDto {
    private Integer id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private String category;
    private String imageUrl;
    private Boolean isActive;
    private String businessCode;
}
