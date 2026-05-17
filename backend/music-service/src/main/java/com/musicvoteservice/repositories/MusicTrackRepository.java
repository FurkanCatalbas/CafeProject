package com.musicvoteservice.repositories;

import com.musicvoteservice.models.MusicTrackEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MusicTrackRepository extends JpaRepository<MusicTrackEntity, Integer> {
    List<MusicTrackEntity> findByPlaceIdAndPlaylistIdOrderByPlaylistPositionAsc(Integer placeId, String playlistId);

    List<MusicTrackEntity> findByPlaceIdOrderByPlaylistPositionAsc(Integer placeId);

    Optional<MusicTrackEntity> findByIdAndPlaceId(Integer id, Integer placeId);

    long countByPlaceId(Integer placeId);

    void deleteByPlaceId(Integer placeId);
}
