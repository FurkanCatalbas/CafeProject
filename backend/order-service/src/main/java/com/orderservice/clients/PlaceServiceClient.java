package com.orderservice.clients;

import com.wise.core.exceptions.BadRequestException;
import com.wise.core.enums.PlaceStatus;
import com.wise.core.models.QueryResponse;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class PlaceServiceClient {

    private static final String PLACE_SERVICE_URL = "http://place-service/api/places/{id}/close";
    private static final String PLACE_SERVICE_GET_URL = "http://place-service/api/places/{id}";

    private final RestTemplate restTemplate;

    public void validatePlaceForOrder(Integer placeId, Integer userId, String userRole) {
        if (placeId == null || placeId <= 0) {
            throw new BadRequestException("Gecerli bir masa secilmelidir.");
        }

        HttpHeaders headers = buildHeaders(userId, userRole);

        try {
            QueryResponse<PlaceClientDto> response = restTemplate.exchange(
                    PLACE_SERVICE_GET_URL,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    new ParameterizedTypeReference<QueryResponse<PlaceClientDto>>() {
                    },
                    placeId
            ).getBody();

            PlaceClientDto place = response == null ? null : response.getData();
            if (place == null || place.getId() == null) {
                throw new BadRequestException("Masa bulunamadi: " + placeId);
            }
            if (place.getStatus() == PlaceStatus.CLOSED) {
                throw new BadRequestException("Kapali masaya siparis olusturulamaz: " + placeId);
            }
            if (place.getStatus() == PlaceStatus.RESERVED) {
                throw new BadRequestException("Rezerve masaya siparis olusturulamaz: " + placeId);
            }
        } catch (BadRequestException exception) {
            throw exception;
        } catch (RestClientException exception) {
            throw new BadRequestException("Masa bilgisi dogrulanamadi: " + placeId);
        }
    }

    public void closePlace(Integer placeId, Integer userId, String userRole) {
        if (placeId == null) {
            return;
        }

        HttpHeaders headers = buildHeaders(userId, userRole);

        try {
            restTemplate.exchange(
                    PLACE_SERVICE_URL,
                    HttpMethod.PATCH,
                    new HttpEntity<>(headers),
                    String.class,
                    placeId
            );
        } catch (RestClientException exception) {
            throw new BadRequestException("Masa kapatilamadi: " + placeId);
        }
    }

    private HttpHeaders buildHeaders(Integer userId, String userRole) {
        HttpHeaders headers = new HttpHeaders();
        if (userId != null) {
            headers.set("X-User-Id", userId.toString());
        }
        if (userRole != null && !userRole.isBlank()) {
            headers.set("X-User-Role", userRole);
        }
        return headers;
    }

    @Data
    private static class PlaceClientDto {
        private Integer id;
        private PlaceStatus status;
        private Integer managerId;
        private String name;
    }
}
