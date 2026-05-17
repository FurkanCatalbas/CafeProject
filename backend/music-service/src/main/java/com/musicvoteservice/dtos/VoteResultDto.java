package com.musicvoteservice.dtos;

import lombok.Data;

@Data
public class VoteResultDto {
    private boolean accepted;
    private boolean duplicate;
    private VoteRoundDto round;
}
