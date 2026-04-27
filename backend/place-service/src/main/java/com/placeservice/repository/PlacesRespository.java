package com.placeservice.repository;

import com.placeservice.models.PlaceEntity;
import com.wise.core.enums.PlaceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlacesRespository extends JpaRepository<PlaceEntity,Integer> {
    List<PlaceEntity> findByStatus(PlaceStatus status);
}
