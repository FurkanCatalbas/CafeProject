package com.musicvoteservice.dtos;

import lombok.Data;

@Data
public class TrackDto {
    private Integer id;
    private String spotifyTrackId;
    private String spotifyUri;
    private String name;
    private String artistName;
    private String albumName;
    private String imageUrl;
    private String externalUrl;
    private Integer playlistPosition;
}
