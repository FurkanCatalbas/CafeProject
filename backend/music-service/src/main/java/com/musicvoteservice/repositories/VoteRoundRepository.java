package com.musicvoteservice.repositories;

import com.musicvoteservice.models.VoteRoundEntity;
import com.musicvoteservice.models.VoteRoundStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoteRoundRepository extends JpaRepository<VoteRoundEntity, Integer> {
    Optional<VoteRoundEntity> findFirstByPlaceIdAndStatusOrderByRoundNumberDesc(Integer placeId, VoteRoundStatus status);

    Optional<VoteRoundEntity> findTopByPlaceIdOrderByRoundNumberDesc(Integer placeId);

    Optional<VoteRoundEntity> findByIdAndPlaceId(Integer id, Integer placeId);

    List<VoteRoundEntity> findByPlaceId(Integer placeId);

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("DELETE FROM VoteRoundEntity r WHERE r.placeId = :placeId")
    void deleteByPlaceId(Integer placeId);

    List<VoteRoundEntity> findAllByStatusAndAutoTransitionTrueAndTargetTransitionAtBefore(VoteRoundStatus status, java.time.LocalDateTime time);
}
