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
        name = "MUSIC_VENUE_SESSIONS",
        uniqueConstraints = {
                @UniqueConstraint(name = "UK_MUSIC_SESSION_PLACE", columnNames = "PLACE_ID"),
                @UniqueConstraint(name = "UK_MUSIC_SESSION_QR", columnNames = "QR_CODE")
        }
)
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class MusicVenueSessionEntity extends BaseEntity {

    @Column(name = "PLACE_ID", nullable = false)
    private Integer placeId;

    @Column(name = "OWNER_USER_ID", nullable = false)
    private Integer ownerUserId;

    @Column(name = "QR_CODE", nullable = false, length = 64)
    private String qrCode;

    @Column(name = "PUBLIC_VOTING_URL", nullable = false, length = 512)
    private String publicVotingUrl;

    @Column(name = "SELECTED_PLAYLIST_ID", length = 128)
    private String selectedPlaylistId;

    @Column(name = "PLAYLIST_NAME")
    private String playlistName;

    @Column(name = "ACTIVE", nullable = false)
    private Boolean active = true;

    @Column(name = "CURRENT_TRACK_OFFSET", nullable = false)
    private Integer currentTrackOffset = 0;
}
