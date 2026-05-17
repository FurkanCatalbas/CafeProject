package com.musicvoteservice.dtos;

import com.musicvoteservice.models.VoteRoundStatus;
import lombok.Data;

@Data
public class VoteRoundDto {
    private Integer id;
    private Integer roundNumber;
    private VoteRoundStatus status;
    private TrackDto leftTrack;
    private TrackDto rightTrack;
    private long leftVotes;
    private long rightVotes;
    private TrackDto winnerTrack;
}
