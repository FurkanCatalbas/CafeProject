package com.musicvoteservice.dtos;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SpotifyConnectionStatusDto {
    private Integer placeId;
    private boolean connected;
    private String spotifyUserId;
    private String displayName;
    private LocalDateTime tokenExpiresAt;
}
