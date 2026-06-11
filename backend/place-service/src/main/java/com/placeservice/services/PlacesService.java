package com.placeservice.services;

import com.placeservice.models.PlaceDto;
import com.wise.core.enums.PlaceStatus;

import java.util.List;

public interface PlacesService {
    PlaceDto create(PlaceDto placeDto);
    PlaceDto update(PlaceDto placeDto);
    PlaceDto getById(Integer id);
    List<PlaceDto> getAll();
    List<PlaceDto> getByStatus(PlaceStatus status);
    PlaceDto updateStatus(Integer id, PlaceStatus status);
    PlaceDto close(Integer id);
    PlaceDto getByQrCode(String qrCode);
    void delete(Integer id);
}
