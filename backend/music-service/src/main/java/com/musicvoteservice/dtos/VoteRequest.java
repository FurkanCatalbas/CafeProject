package com.musicvoteservice.dtos;

import lombok.Data;

@Data
public class VoteRequest {
    private Integer roundId;
    private Integer trackId;
    private String voterKey;
}
