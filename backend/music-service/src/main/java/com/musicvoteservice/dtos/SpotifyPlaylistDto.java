package com.musicvoteservice.dtos;

import lombok.Data;

@Data
public class SpotifyPlaylistDto {
    private String id;
    private String name;
    private String uri;
    private Integer trackCount;
    private String imageUrl;
    private String externalUrl;
}
