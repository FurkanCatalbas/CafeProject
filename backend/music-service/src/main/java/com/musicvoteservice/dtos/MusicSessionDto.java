package com.musicvoteservice.dtos;

import lombok.Data;

@Data
public class MusicSessionDto {
    private Integer placeId;
    private Integer ownerUserId;
    private String qrCode;
    private String publicVotingUrl;
    private String qrImageUrl;
    private String selectedPlaylistId;
    private String playlistName;
    private Boolean active;
    private long trackCount;
}
