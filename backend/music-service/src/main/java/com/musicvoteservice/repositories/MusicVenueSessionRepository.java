package com.musicvoteservice.repositories;

import com.musicvoteservice.models.MusicVenueSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MusicVenueSessionRepository extends JpaRepository<MusicVenueSessionEntity, Integer> {
    Optional<MusicVenueSessionEntity> findByPlaceId(Integer placeId);

    Optional<MusicVenueSessionEntity> findByQrCode(String qrCode);

    boolean existsByQrCode(String qrCode);
}
