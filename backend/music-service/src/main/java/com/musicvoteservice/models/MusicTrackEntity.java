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
        name = "MUSIC_TRACKS",
        uniqueConstraints = {
                @UniqueConstraint(name = "UK_MUSIC_TRACK_PLACE_PLAYLIST_URI", columnNames = {"PLACE_ID", "PLAYLIST_ID", "SPOTIFY_URI"})
        }
)
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class MusicTrackEntity extends BaseEntity {

    @Column(name = "PLACE_ID", nullable = false)
    private Integer placeId;

    @Column(name = "PLAYLIST_ID", nullable = false, length = 128)
    private String playlistId;

    @Column(name = "SPOTIFY_TRACK_ID", nullable = false, length = 128)
    private String spotifyTrackId;

    @Column(name = "SPOTIFY_URI", nullable = false, length = 256)
    private String spotifyUri;

    @Column(name = "NAME", nullable = false, length = 1024)
    private String name;

    @Column(name = "ARTIST_NAME", length = 2048)
    private String artistName;

    @Column(name = "ALBUM_NAME", length = 1024)
    private String albumName;

    @Column(name = "IMAGE_URL", length = 1024)
    private String imageUrl;

    @Column(name = "EXTERNAL_URL", length = 1024)
    private String externalUrl;

    @Column(name = "PLAYLIST_POSITION", nullable = false)
    private Integer playlistPosition;

    @Column(name = "ACTIVE", nullable = false)
    private Boolean active = true;
}
