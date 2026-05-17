package com.musicvoteservice.repositories;

import com.musicvoteservice.models.VoteRoundEntity;
import com.musicvoteservice.models.VoteRoundStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoteRoundRepository extends JpaRepository<VoteRoundEntity, Integer> {
    Optional<VoteRoundEntity> findFirstByPlaceIdAndStatusOrderByRoundNumberDesc(Integer placeId, VoteRoundStatus status);

    Optional<VoteRoundEntity> findTopByPlaceIdOrderByRoundNumberDesc(Integer placeId);

    Optional<VoteRoundEntity> findByIdAndPlaceId(Integer id, Integer placeId);

    List<VoteRoundEntity> findByPlaceId(Integer placeId);

    void deleteByPlaceId(Integer placeId);
}
