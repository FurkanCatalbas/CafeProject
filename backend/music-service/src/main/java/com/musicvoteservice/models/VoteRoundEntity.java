package com.musicvoteservice.models;

import com.wise.core.models.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "MUSIC_VOTE_ROUNDS")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class VoteRoundEntity extends BaseEntity {

    @Column(name = "PLACE_ID", nullable = false)
    private Integer placeId;

    @Column(name = "QR_CODE", nullable = false, length = 64)
    private String qrCode;

    @Column(name = "ROUND_NUMBER", nullable = false)
    private Integer roundNumber;

    @Column(name = "LEFT_TRACK_ID", nullable = false)
    private Integer leftTrackId;

    @Column(name = "RIGHT_TRACK_ID", nullable = false)
    private Integer rightTrackId;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false, length = 32)
    private VoteRoundStatus status;

    @Column(name = "WINNER_TRACK_ID")
    private Integer winnerTrackId;

    @Column(name = "CLOSED_AT")
    private LocalDateTime closedAt;
}
