package com.musicvoteservice.dtos;

import lombok.Data;

@Data
public class PublicVoteSessionDto {
    private Integer placeId;
    private String qrCode;
    private String playlistName;
    private VoteRoundDto currentRound;
}
