package com.placeservice.services;

import com.placeservice.models.PlaceDto;
import com.placeservice.models.PlaceEntity;
import com.placeservice.repository.PlacesRespository;
import com.wise.core.enums.PlaceStatus;
import com.wise.core.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlaceServiceImpl implements PlacesService {

    private final PlacesRespository placesRepository;

    @Override
    public PlaceDto create(PlaceDto placeDto) {
        placeDto.setId(null);
        if (placeDto.getStatus() == null) {
            placeDto.setStatus(PlaceStatus.AVAILABLE);
        }
        PlaceEntity entity = placesRepository.save(toEntity(placeDto));
        return toDto(entity);
    }

    @Override
    public PlaceDto update(PlaceDto placeDto) {
        getById(placeDto.getId());
        PlaceEntity entity = placesRepository.save(toEntity(placeDto));
        return toDto(entity);
    }

    @Override
    public PlaceDto getById(Integer id) {
        PlaceEntity entity = placesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Masa bulunamadi: " + id));
        return toDto(entity);
    }

    @Override
    public List<PlaceDto> getAll() {
        return placesRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<PlaceDto> getByStatus(PlaceStatus status) {
        return placesRepository.findByStatus(status).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public PlaceDto updateStatus(Integer id, PlaceStatus status) {
        PlaceEntity entity = placesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Masa bulunamadi: " + id));
        entity.setStatus(status);
        return toDto(placesRepository.save(entity));
    }

    @Override
    public PlaceDto close(Integer id) {
        return updateStatus(id, PlaceStatus.AVAILABLE);
    }

    @Override
    public void delete(Integer id) {
        getById(id);
        placesRepository.deleteById(id);
    }

    private PlaceDto toDto(PlaceEntity entity) {
        if (entity == null) {
            return null;
        }
        PlaceDto dto = new PlaceDto();
        BeanUtils.copyProperties(entity, dto);
        return dto;
    }

    private PlaceEntity toEntity(PlaceDto dto) {
        if (dto == null) {
            return null;
        }
        PlaceEntity entity = new PlaceEntity();
        BeanUtils.copyProperties(dto, entity);
        return entity;
    }
}
