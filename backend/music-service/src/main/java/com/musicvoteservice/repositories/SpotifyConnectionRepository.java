package com.musicvoteservice.repositories;

import com.musicvoteservice.models.SpotifyConnectionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpotifyConnectionRepository extends JpaRepository<SpotifyConnectionEntity, Integer> {
    Optional<SpotifyConnectionEntity> findByPlaceId(Integer placeId);
}
