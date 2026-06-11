package com.productservice.services;

import com.productservice.mappers.ProductMapper;
import com.productservice.models.ProductDto;
import com.productservice.models.ProductEntity;
import com.productservice.repository.ProductsRepository;
import com.wise.core.enums.RecordStatusType;
import com.wise.core.exceptions.ResourceNotFoundException;
import com.wise.core.models.DefaultValueSetterBaseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductsServiceImpl implements ProductsService {

    private final ProductsRepository productsRepository;

    @Override
    public ProductDto create(ProductDto dto, String requesterRole, String businessCode) {
        dto.setId(null);
        applyRequesterBusiness(dto, requesterRole, businessCode);
        return saveOrUpdate(RecordStatusType.CREATE, dto);
    }

    @Override
    public ProductDto update(ProductDto dto, String requesterRole, String businessCode) {
        ProductDto existing = getById(dto.getId());
        ensureSameBusiness(existing, requesterRole, businessCode);
        applyRequesterBusiness(dto, requesterRole, businessCode);
        return saveOrUpdate(RecordStatusType.UPDATE, dto);
    }

    private ProductDto saveOrUpdate(RecordStatusType recordStatusType, ProductDto dto) {
        if (recordStatusType == RecordStatusType.CREATE) {
            DefaultValueSetterBaseDto.setDefaultValue(dto, RecordStatusType.CREATE, null);
        } else if (recordStatusType == RecordStatusType.UPDATE) {
            DefaultValueSetterBaseDto.setDefaultValue(dto, RecordStatusType.UPDATE, null);
        }

        ProductEntity entity = productsRepository.save(toEntity(dto));
        dto.setId(entity.getId());

        return toDto(entity);
    }

    @Override
    public ProductDto getById(Integer id) {
        ProductEntity entity = productsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Urun bulunamadi: " + id));
        return toDto(entity);
    }

    @Override
    public List<ProductDto> getAll(String requesterRole, String businessCode) {
        return productsRepository.findAll().stream()
                .map(this::toDto)
                .filter(dto -> canAccess(dto, requesterRole, businessCode))
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductDto> getByCategory(String category, String requesterRole, String businessCode) {
        return productsRepository.findByCategory(category).stream()
                .map(this::toDto)
                .filter(dto -> canAccess(dto, requesterRole, businessCode))
                .collect(Collectors.toList());
    }

    @Override
    public void delete(Integer id) {
        getById(id);
        productsRepository.deleteById(id);
    }

    private ProductDto toDto(ProductEntity entity) {
        return ProductMapper.INSTANCE.toDto(entity);
    }

    private ProductEntity toEntity(ProductDto dto) {
        return ProductMapper.INSTANCE.toEntity(dto);
    }

    private void applyRequesterBusiness(ProductDto dto, String requesterRole, String businessCode) {
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

    private void ensureSameBusiness(ProductDto dto, String requesterRole, String businessCode) {
        if (!canAccess(dto, requesterRole, businessCode)) {
            throw new com.wise.core.exceptions.BadRequestException("Bu isletmedeki urune erisim yetkiniz yok.");
        }
    }

    private boolean canAccess(ProductDto dto, String requesterRole, String businessCode) {
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
