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
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlaceServiceImpl implements PlacesService {

    private final PlacesRespository placesRepository;

    @Override
    public PlaceDto create(PlaceDto placeDto, String requesterRole, String businessCode) {
        placeDto.setId(null);
        applyRequesterBusiness(placeDto, requesterRole, businessCode);
        if (placeDto.getStatus() == null) {
            placeDto.setStatus(PlaceStatus.AVAILABLE);
        }

        // QR Kod üretimi (Eğer boş gelirse otomatik üret)
        if (placeDto.getQrCode() == null || placeDto.getQrCode().isBlank()) {
            placeDto.setQrCode("T-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }

        PlaceEntity entity = placesRepository.save(toEntity(placeDto));
        return toDto(entity);
    }

    @Override
    public PlaceDto update(PlaceDto placeDto, String requesterRole, String businessCode) {
        PlaceEntity entity = placesRepository.findById(placeDto.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Masa bulunamadi: " + placeDto.getId()));
        
        // Yetki kontrolü
        PlaceDto existingDto = toDto(entity);
        ensureSameBusiness(existingDto, requesterRole, businessCode);

        // Alanları güncelle
        if (placeDto.getName() != null && !placeDto.getName().isBlank()) {
            entity.setName(placeDto.getName().trim());
        }
        
        if (placeDto.getStatus() != null) {
            entity.setStatus(placeDto.getStatus());
        }
        
        if (placeDto.getManagerId() != null) {
            entity.setManagerId(placeDto.getManagerId());
        }

        // QR kodu koru veya yoksa üret
        if (placeDto.getQrCode() != null && !placeDto.getQrCode().isBlank()) {
            entity.setQrCode(placeDto.getQrCode());
        } else if (entity.getQrCode() == null || entity.getQrCode().isBlank()) {
            entity.setQrCode("T-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        
        // İşletme kodunu koru veya güncelle
        if (isAdmin(requesterRole) && placeDto.getBusinessCode() != null) {
            entity.setBusinessCode(normalizeBusinessCode(placeDto.getBusinessCode()));
        } else if (!isAdmin(requesterRole)) {
            entity.setBusinessCode(normalizeBusinessCode(businessCode));
        }

        PlaceEntity updatedEntity = placesRepository.save(entity);
        return toDto(updatedEntity);
    }

    @Override
    public PlaceDto getById(Integer id) {
        PlaceEntity entity = placesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Masa bulunamadi: " + id));
        return toDto(entity);
    }

    @Override
    public List<PlaceDto> getAll(String requesterRole, String businessCode) {
        return placesRepository.findAll().stream()
                .map(this::toDto)
                .filter(dto -> canAccess(dto, requesterRole, businessCode))
                .collect(Collectors.toList());
    }

    @Override
    public List<PlaceDto> getByStatus(PlaceStatus status, String requesterRole, String businessCode) {
        return placesRepository.findByStatus(status).stream()
                .map(this::toDto)
                .filter(dto -> canAccess(dto, requesterRole, businessCode))
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
    public PlaceDto getByQrCode(String qrCode) {
        return placesRepository.findByQrCode(qrCode)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("QR koda ait masa bulunamadi: " + qrCode));
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

    private void applyRequesterBusiness(PlaceDto dto, String requesterRole, String businessCode) {
        if (!isAdmin(requesterRole)) {
            String normalizedBusinessCode = normalizeBusinessCode(businessCode);
            if (normalizedBusinessCode == null) {
                throw new com.wise.core.exceptions.BadRequestException("Isletme kodu bulunamadi.");
            }
            dto.setBusinessCode(normalizedBusinessCode);
            return;
        }
        dto.setBusinessCode(normalizeBusinessCode(dto.getBusinessCode()));
    }

    private void ensureSameBusiness(PlaceDto dto, String requesterRole, String businessCode) {
        if (!canAccess(dto, requesterRole, businessCode)) {
            throw new com.wise.core.exceptions.BadRequestException("Bu isletmedeki masaya erisim yetkiniz yok.");
        }
    }

    private boolean canAccess(PlaceDto dto, String requesterRole, String businessCode) {
        if (isAdmin(requesterRole)) {
            return true;
        }
        String normalizedBusinessCode = normalizeBusinessCode(businessCode);
        return normalizedBusinessCode != null && normalizedBusinessCode.equalsIgnoreCase(dto.getBusinessCode());
    }

    private boolean isAdmin(String requesterRole) {
        return requesterRole != null && com.wise.core.enums.UserRole.ADMIN.getValue().equalsIgnoreCase(requesterRole.trim());
    }

    private String normalizeBusinessCode(String businessCode) {
        return businessCode == null || businessCode.isBlank() ? null : businessCode.trim().toUpperCase(Locale.ROOT);
    }
}
