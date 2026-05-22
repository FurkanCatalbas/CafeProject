package com.orderservice.clients;

import com.wise.core.exceptions.BadRequestException;
import com.wise.core.models.QueryResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class ProductServiceClient {

    private static final String PRODUCT_SERVICE_GET_URL = "http://product-service/api/products/{id}";

    private final RestTemplate restTemplate;

    public ProductClientDto getProductById(Integer productId) {
        if (productId == null || productId <= 0) {
            throw new BadRequestException("Gecerli bir urun secilmelidir.");
        }

        try {
            QueryResponse<ProductClientDto> response = restTemplate.exchange(
                    PRODUCT_SERVICE_GET_URL,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<QueryResponse<ProductClientDto>>() {
                    },
                    productId
            ).getBody();

            ProductClientDto product = response == null ? null : response.getData();
            if (product == null || product.getId() == null) {
                throw new BadRequestException("Urun bulunamadi: " + productId);
            }
            if (Boolean.FALSE.equals(product.getIsActive())) {
                throw new BadRequestException("Pasif urun siparise eklenemez: " + productId);
            }
            if (product.getPrice() == null) {
                throw new BadRequestException("Urun fiyati eksik: " + productId);
            }
            return product;
        } catch (BadRequestException exception) {
            throw exception;
        } catch (RestClientException exception) {
            throw new BadRequestException("Urun bilgisi dogrulanamadi: " + productId);
        }
    }

    @Data
    public static class ProductClientDto {
        private Integer id;
        private String name;
        private String description;
        private BigDecimal price;
        private Integer stock;
        private String category;
        private String imageUrl;
        private Boolean isActive;
    }
}
