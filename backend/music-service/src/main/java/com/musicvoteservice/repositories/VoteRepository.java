package com.musicvoteservice.repositories;

import com.musicvoteservice.models.VoteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<VoteEntity, Integer> {
    Optional<VoteEntity> findByRoundIdAndVoterKey(Integer roundId, String voterKey);

    long countByRoundIdAndTrackId(Integer roundId, Integer trackId);

    void deleteByRoundIdIn(Collection<Integer> roundIds);
}
