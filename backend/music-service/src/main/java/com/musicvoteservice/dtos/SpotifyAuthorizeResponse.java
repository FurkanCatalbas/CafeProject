package com.musicvoteservice.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpotifyAuthorizeResponse {
    private String authorizationUrl;
    private String state;
}
