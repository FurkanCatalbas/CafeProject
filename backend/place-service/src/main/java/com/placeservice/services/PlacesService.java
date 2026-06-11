package com.placeservice.services;

import com.placeservice.models.PlaceDto;
import com.wise.core.enums.PlaceStatus;

import java.util.List;

public interface PlacesService {
    PlaceDto create(PlaceDto placeDto, String requesterRole, String businessCode);
    PlaceDto update(PlaceDto placeDto, String requesterRole, String businessCode);
    PlaceDto getById(Integer id);
    List<PlaceDto> getAll(String requesterRole, String businessCode);
    List<PlaceDto> getByStatus(PlaceStatus status, String requesterRole, String businessCode);
    PlaceDto updateStatus(Integer id, PlaceStatus status);
    PlaceDto close(Integer id);
    PlaceDto getByQrCode(String qrCode);
    void delete(Integer id);
}
