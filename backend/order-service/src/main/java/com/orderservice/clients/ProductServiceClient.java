package com.orderservice.clients;

import com.wise.core.exceptions.BadRequestException;
import com.wise.core.models.QueryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class ProductServiceClient {

    private static final String PRODUCT_SERVICE_URL = "http://product-service/api/products/{id}";
    private static final String PRODUCTS_SERVICE_URL = "http://product-service/api/products";

    private final RestTemplate restTemplate;

    public ProductClientDto getById(Integer productId) {
        if (productId == null || productId <= 0) {
            throw new BadRequestException("Gecerli bir urun secilmelidir.");
        }

        try {
            QueryResponse<ProductClientDto> response = restTemplate.exchange(
                    PRODUCT_SERVICE_URL,
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
            return product;
        } catch (BadRequestException exception) {
            throw exception;
        } catch (RestClientException exception) {
            throw new BadRequestException("Urun bilgisi dogrulanamadi: " + productId);
        }
    }

    public ProductClientDto getProductById(Integer productId) {
        return getById(productId);
    }

    public void updateStock(ProductClientDto product, Integer userId, String userRole, String businessCode) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-Id", userId != null && userId > 0 ? userId.toString() : "0");
        headers.set("X-User-Role", userRole != null && !userRole.isBlank() ? userRole : "USER");
        headers.set("X-Business-Code", businessCode == null ? "" : businessCode);

        try {
            restTemplate.exchange(
                    PRODUCTS_SERVICE_URL,
                    HttpMethod.PUT,
                    new HttpEntity<>(product, headers),
                    new ParameterizedTypeReference<QueryResponse<ProductClientDto>>() {
                    }
            );
        } catch (RestClientException exception) {
            throw new BadRequestException("Urun stogu guncellenemedi: " + product.getId());
        }
    }
}
