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
        name = "MUSIC_SPOTIFY_OAUTH_STATES",
        uniqueConstraints = {
                @UniqueConstraint(name = "UK_MUSIC_SPOTIFY_STATE", columnNames = "STATE")
        }
)
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class SpotifyOAuthStateEntity extends BaseEntity {

    @Column(name = "STATE", nullable = false, length = 128)
    private String state;

    @Column(name = "OWNER_USER_ID", nullable = false)
    private Integer ownerUserId;

    @Column(name = "PLACE_ID", nullable = false)
    private Integer placeId;

    @Column(name = "EXPIRES_AT", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "USED", nullable = false)
    private Boolean used = false;
}
