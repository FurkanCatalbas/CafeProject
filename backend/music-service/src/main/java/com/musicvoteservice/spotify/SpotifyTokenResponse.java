package com.musicvoteservice.spotify;

import lombok.Data;

@Data
public class SpotifyTokenResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private String scope;
    private Integer expiresIn;
}
