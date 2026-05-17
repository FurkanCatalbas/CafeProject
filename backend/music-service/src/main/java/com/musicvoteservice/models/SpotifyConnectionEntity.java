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

import java.time.LocalDateTime;

@Entity
@Table(
        name = "MUSIC_SPOTIFY_CONNECTIONS",
        uniqueConstraints = {
                @UniqueConstraint(name = "UK_MUSIC_SPOTIFY_PLACE", columnNames = "PLACE_ID")
        }
)
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class SpotifyConnectionEntity extends BaseEntity {

    @Column(name = "OWNER_USER_ID", nullable = false)
    private Integer ownerUserId;

    @Column(name = "PLACE_ID", nullable = false)
    private Integer placeId;

    @Column(name = "SPOTIFY_USER_ID", length = 128)
    private String spotifyUserId;

    @Column(name = "DISPLAY_NAME")
    private String displayName;

    @Column(name = "ACCESS_TOKEN", length = 4096, nullable = false)
    private String accessToken;

    @Column(name = "REFRESH_TOKEN", length = 4096)
    private String refreshToken;

    @Column(name = "TOKEN_TYPE", length = 32)
    private String tokenType;

    @Column(name = "SCOPE", length = 1024)
    private String scope;

    @Column(name = "TOKEN_EXPIRES_AT", nullable = false)
    private LocalDateTime tokenExpiresAt;

    @Column(name = "CONNECTED_AT", nullable = false)
    private LocalDateTime connectedAt;
}
