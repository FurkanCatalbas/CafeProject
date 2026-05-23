package com.musicvoteservice.spotify;

import com.fasterxml.jackson.databind.JsonNode;
import com.musicvoteservice.dtos.SpotifyPlaylistDto;
import com.musicvoteservice.dtos.TrackDto;
import com.wise.core.exceptions.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class SpotifyClient {

    private static final String ACCOUNTS_BASE_URL = "https://accounts.spotify.com";
    private static final String API_BASE_URL = "https://api.spotify.com/v1";

    private final RestTemplate restTemplate;
    private final SpotifyProperties properties;

    public String buildAuthorizeUrl(String state) {
        ensureConfigured();
        return UriComponentsBuilder
                .fromHttpUrl(ACCOUNTS_BASE_URL + "/authorize")
                .queryParam("client_id", properties.getClientId())
                .queryParam("response_type", "code")
                .queryParam("redirect_uri", properties.getRedirectUri())
                .queryParam("scope", properties.getScope())
                .queryParam("state", state)
                .encode(StandardCharsets.UTF_8)
                .build()
                .toUriString();
    }

    public SpotifyTokenResponse exchangeCode(String code) {
        ensureConfigured();

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "authorization_code");
        form.add("code", code);
        form.add("redirect_uri", properties.getRedirectUri());

        return requestToken(form);
    }

    public SpotifyTokenResponse refreshToken(String refreshToken) {
        ensureConfigured();

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "refresh_token");
        form.add("refresh_token", refreshToken);

        return requestToken(form);
    }

    public JsonNode getCurrentUser(String accessToken) {
        return exchange(accessToken, HttpMethod.GET, API_BASE_URL + "/me", null);
    }

    public List<SpotifyPlaylistDto> getCurrentUserPlaylists(String accessToken) {
        List<SpotifyPlaylistDto> playlists = new ArrayList<>();
        int offset = 0;
        int limit = 50;

        while (true) {
            String url = UriComponentsBuilder.fromHttpUrl(API_BASE_URL + "/me/playlists")
                    .queryParam("limit", limit)
                    .queryParam("offset", offset)
                    .toUriString();
            JsonNode response = exchange(accessToken, HttpMethod.GET, url, null);
            JsonNode items = response.path("items");

            if (!items.isArray() || items.isEmpty()) {
                break;
            }

            for (JsonNode item : items) {
                try {
                    SpotifyPlaylistDto dto = new SpotifyPlaylistDto();
                    dto.setId(text(item.path("id")));
                    dto.setName(text(item.path("name")));
                    dto.setUri(text(item.path("uri")));
                    
                    // Şarkı sayısını çekme (tracks.total)
                    JsonNode tracksNode = item.path("tracks");
                    int total = tracksNode.path("total").asInt(0);
                    dto.setTrackCount(total);
                    
                    dto.setImageUrl(firstImage(item.path("images")));
                    dto.setExternalUrl(text(item.path("external_urls").path("spotify")));
                    
                    if (dto.getId() != null) {
                        playlists.add(dto);
                    }
                } catch (Exception e) {
                    System.err.println("[SPOTIFY-CLIENT] Playlist parse hatası: " + e.getMessage());
                }
            }

            if (response.path("next").isNull() || response.path("next").isMissingNode()) {
                break;
            }
            offset += limit;
        }

        return playlists;
    }

    public String getPlaylistName(String accessToken, String playlistId) {
        JsonNode playlist = exchange(accessToken, HttpMethod.GET, API_BASE_URL + "/playlists/" + playlistId, null);
        return text(playlist.path("name"));
    }

    public List<TrackDto> getPlaylistTracks(String accessToken, String playlistId) {
        List<TrackDto> tracks = new ArrayList<>();
        int offset = 0;
        int limit = 50;

        System.out.println("[SPOTIFY-CLIENT] Playlist sarkilari cekiliyor ID: " + playlistId);

        while (true) {
            String url = UriComponentsBuilder.fromHttpUrl(API_BASE_URL + "/playlists/" + playlistId + "/items")
                    .queryParam("limit", limit)
                    .queryParam("offset", offset)
                    .toUriString();
            JsonNode response = exchange(accessToken, HttpMethod.GET, url, null);
            JsonNode items = response.path("items");

            if (!items.isArray() || items.isEmpty()) {
                break;
            }

            for (JsonNode item : items) {
                JsonNode track = item.path("track");
                String type = text(track.path("type"));
                boolean isLocal = track.path("is_local").asBoolean(false);

                if (!"track".equals(type) || isLocal) {
                    System.out.println("[SPOTIFY-CLIENT] Item atlandi (Type: " + type + ", Local: " + isLocal + ")");
                    continue;
                }

                TrackDto dto = new TrackDto();
                dto.setSpotifyTrackId(text(track.path("id")));
                dto.setSpotifyUri(text(track.path("uri")));
                dto.setName(text(track.path("name")));
                dto.setArtistName(artistNames(track.path("artists")));
                dto.setAlbumName(text(track.path("album").path("name")));
                dto.setImageUrl(firstImage(track.path("album").path("images")));
                dto.setExternalUrl(text(track.path("external_urls").path("spotify")));
                dto.setPlaylistPosition(tracks.size());

                if (dto.getSpotifyTrackId() != null && dto.getSpotifyUri() != null) {
                    tracks.add(dto);
                } else {
                    System.out.println("[SPOTIFY-CLIENT] Sarki bilgisi eksik, eklenemedi: " + dto.getName());
                }
            }

            if (response.path("next").isNull() || response.path("next").isMissingNode()) {
                break;
            }
            offset += limit;
        }

        System.out.println("[SPOTIFY-CLIENT] Toplam " + tracks.size() + " sarki basariyla alindi.");
        return tracks;
    }

    public void startPlayback(String accessToken, String spotifyUri, String deviceId) {
        String url = UriComponentsBuilder.fromHttpUrl(API_BASE_URL + "/me/player/play")
                .queryParamIfPresent("device_id", java.util.Optional.ofNullable(deviceId).filter(value -> !value.isBlank()))
                .toUriString();

        exchange(accessToken, HttpMethod.PUT, url, Map.of("uris", List.of(spotifyUri)));
    }

    private SpotifyTokenResponse requestToken(MultiValueMap<String, String> form) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.set(HttpHeaders.AUTHORIZATION, "Basic " + basicAuthToken());

        try {
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    ACCOUNTS_BASE_URL + "/api/token",
                    HttpMethod.POST,
                    new HttpEntity<>(form, headers),
                    JsonNode.class
            );
            JsonNode body = response.getBody();
            if (body == null) {
                throw new BadRequestException("Spotify token cevabi bos dondu.");
            }

            SpotifyTokenResponse tokenResponse = new SpotifyTokenResponse();
            tokenResponse.setAccessToken(text(body.path("access_token")));
            tokenResponse.setRefreshToken(text(body.path("refresh_token")));
            tokenResponse.setTokenType(text(body.path("token_type")));
            tokenResponse.setScope(text(body.path("scope")));
            tokenResponse.setExpiresIn(body.path("expires_in").isNumber() ? body.path("expires_in").asInt() : 3600);
            return tokenResponse;
        } catch (RestClientResponseException exception) {
            throw new BadRequestException("Spotify token istegi basarisiz: "
                    + exception.getStatusCode().value()
                    + spotifyErrorDetails(exception));
        }
    }

    private JsonNode exchange(String accessToken, HttpMethod method, String url, Object body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    url,
                    method,
                    new HttpEntity<>(body, headers),
                    JsonNode.class
            );
            return response.getBody() == null ? com.fasterxml.jackson.databind.node.NullNode.getInstance() : response.getBody();
        } catch (RestClientResponseException exception) {
            throw new BadRequestException("Spotify API istegi basarisiz: "
                    + exception.getStatusCode().value()
                    + spotifyErrorDetails(exception));
        }
    }

    private String spotifyErrorDetails(RestClientResponseException exception) {
        String body = exception.getResponseBodyAsString();
        if (body == null || body.isBlank()) {
            return "";
        }
        return " - " + body.replaceAll("\\s+", " ").trim();
    }

    private void ensureConfigured() {
        if (isBlank(properties.getClientId()) || isBlank(properties.getClientSecret()) || isBlank(properties.getRedirectUri())) {
            throw new BadRequestException("Spotify ayarlari eksik. SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET ve SPOTIFY_REDIRECT_URI tanimlayin.");
        }
    }

    private String basicAuthToken() {
        String credentials = properties.getClientId() + ":" + properties.getClientSecret();
        return Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String text(JsonNode node) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return null;
        }
        return node.asText();
    }

    private String firstImage(JsonNode images) {
        if (images != null && images.isArray() && !images.isEmpty()) {
            return text(images.get(0).path("url"));
        }
        return null;
    }

    private String artistNames(JsonNode artists) {
        if (artists == null || !artists.isArray()) {
            return null;
        }
        List<String> names = new ArrayList<>();
        artists.forEach(artist -> names.add(text(artist.path("name"))));
        return names.stream().filter(Objects::nonNull).collect(Collectors.joining(", "));
    }
}
