package com.musicvoteservice.models;

import com.wise.core.models.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "MUSIC_VOTES",
        uniqueConstraints = {
                @UniqueConstraint(name = "UK_MUSIC_VOTE_ROUND_VOTER", columnNames = {"ROUND_ID", "VOTER_KEY"})
        }
)
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class VoteEntity extends BaseEntity {

    @Column(name = "ROUND_ID", nullable = false)
    private Integer roundId;

    @Column(name = "TRACK_ID", nullable = false)
    private Integer trackId;

    @Column(name = "VOTER_KEY", nullable = false, length = 128)
    private String voterKey;
}
