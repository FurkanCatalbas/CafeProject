package com.musicvoteservice.repositories;

import com.musicvoteservice.models.MusicTrackEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface MusicTrackRepository extends JpaRepository<MusicTrackEntity, Integer> {
    List<MusicTrackEntity> findByPlaceIdAndPlaylistIdOrderByPlaylistPositionAsc(Integer placeId, String playlistId);

    List<MusicTrackEntity> findByPlaceIdOrderByPlaylistPositionAsc(Integer placeId);

    Optional<MusicTrackEntity> findByIdAndPlaceId(Integer id, Integer placeId);

    long countByPlaceId(Integer placeId);

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("DELETE FROM MusicTrackEntity t WHERE t.placeId = :placeId")
    void deleteByPlaceId(Integer placeId);
}
