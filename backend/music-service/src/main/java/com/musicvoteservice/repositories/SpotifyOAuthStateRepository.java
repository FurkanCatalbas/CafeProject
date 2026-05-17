package com.musicvoteservice.repositories;

import com.musicvoteservice.models.SpotifyOAuthStateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpotifyOAuthStateRepository extends JpaRepository<SpotifyOAuthStateEntity, Integer> {
    Optional<SpotifyOAuthStateEntity> findByState(String state);
}
