package com.orderservice.clients;

import com.wise.core.exceptions.BadRequestException;
import com.wise.core.models.QueryResponse;
<<<<<<< Updated upstream
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
=======
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
>>>>>>> Stashed changes
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

<<<<<<< Updated upstream
import java.math.BigDecimal;

=======
>>>>>>> Stashed changes
@Component
@RequiredArgsConstructor
public class ProductServiceClient {

<<<<<<< Updated upstream
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
=======
    private static final String PRODUCT_SERVICE_URL = "http://product-service/api/products/{id}";
    private static final String PRODUCTS_SERVICE_URL = "http://product-service/api/products";

    private final RestTemplate restTemplate;

    public ProductClientDto getById(Integer productId) {
        try {
            ResponseEntity<QueryResponse<ProductClientDto>> response = restTemplate.exchange(
                    PRODUCT_SERVICE_URL,
                    HttpMethod.GET,
                    HttpEntity.EMPTY,
                    new ParameterizedTypeReference<>() {},
                    productId
            );
            QueryResponse<ProductClientDto> body = response.getBody();
            if (body == null || body.getData() == null) {
                throw new BadRequestException("Urun bulunamadi: " + productId);
            }
            return body.getData();
        } catch (RestClientException exception) {
            throw new BadRequestException("Urun bilgisi alinamadi: " + productId);
        }
    }

    public void updateStock(ProductClientDto product, Integer userId, String userRole, String businessCode) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-Id", userId != null && userId > 0 ? userId.toString() : "1");
        headers.set("X-User-Role", userRole != null && !userRole.isBlank() ? userRole : "ADMIN");
        headers.set("X-Business-Code", businessCode == null ? "" : businessCode);

        try {
            restTemplate.exchange(
                    PRODUCTS_SERVICE_URL,
                    HttpMethod.PUT,
                    new HttpEntity<>(product, headers),
                    new ParameterizedTypeReference<QueryResponse<ProductClientDto>>() {}
            );
        } catch (RestClientException exception) {
            throw new BadRequestException("Urun stogu guncellenemedi: " + product.getId());
        }
>>>>>>> Stashed changes
    }
}
