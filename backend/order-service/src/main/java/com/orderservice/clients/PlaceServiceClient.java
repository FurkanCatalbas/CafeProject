package com.orderservice.clients;

import com.wise.core.exceptions.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class PlaceServiceClient {

    private static final String PLACE_SERVICE_URL = "http://place-service/api/places/{id}/close";

    private final RestTemplate restTemplate;

    public void closePlace(Integer placeId, Integer userId, String userRole) {
        if (placeId == null) {
            return;
        }

        HttpHeaders headers = new HttpHeaders();
        if (userId != null) {
            headers.set("X-User-Id", userId.toString());
        }
        if (userRole != null && !userRole.isBlank()) {
            headers.set("X-User-Role", userRole);
        }

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
}
