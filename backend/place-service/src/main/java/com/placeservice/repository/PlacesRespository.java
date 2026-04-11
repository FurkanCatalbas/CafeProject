package com.placeservice.repository;

import com.placeservice.models.PlaceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlacesRespository extends JpaRepository<PlaceEntity,Integer> {
}
