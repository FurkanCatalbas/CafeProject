package com.placeservice.services;

import com.placeservice.models.PlaceDto;

public interface PlacesService {
    PlaceDto create(PlaceDto placeDto);
    PlaceDto update(PlaceDto placeDto);
    PlaceDto getById(Integer id);
    void delete(Integer id);
}
