package com.userservice.services;

import com.wise.core.enums.RecordStatusType;
import com.wise.core.enums.UserRole;
import com.wise.core.enums.UserStatus;
import com.userservice.mappers.UserMapper;
import com.wise.core.exceptions.ResourceNotFoundException;
import com.wise.core.models.DefaultValueSetterBaseDto;
import com.userservice.models.UserDto;
import com.userservice.models.UserEntity;
import com.userservice.repository.UsersRepository;
import com.userservice.validators.UserSaveValidator;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class UsersServiceImpl implements UsersService {

    private final UsersRepository usersRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserSaveValidator userSaveValidator;
    private final EntityManager entityManager;

    @Override
    public UserDto create(UserDto userDto, String requesterRole, String businessCode) {
        userDto.setId(null);
        applyRequesterBusiness(userDto, requesterRole, businessCode);
        return saveOrUpdate(RecordStatusType.CREATE, userDto);
    }

    @Override
    public UserDto update(UserDto userDto, String requesterRole, String businessCode) {
        UserDto existing = getById(userDto.getId());
        ensureSameBusiness(existing, requesterRole, businessCode);
        applyRequesterBusiness(userDto, requesterRole, businessCode);
        return saveOrUpdate(RecordStatusType.UPDATE, userDto);
    }

    private UserDto saveOrUpdate(RecordStatusType recordStatusType,UserDto dto) {
        if (dto.getStatus() == null) {
            dto.setStatus(UserStatus.ACTIVE);
        }
        if (dto.getRoleName() == null) {
            dto.setRoleName(UserRole.CUSTOMER);
        }
        userSaveValidator.validateSave(dto);

        if (recordStatusType == RecordStatusType.CREATE) {
            dto.setPassword(passwordEncoder.encode(dto.getPassword()));
            DefaultValueSetterBaseDto.setDefaultValue(dto, RecordStatusType.CREATE, null);
        } else if (recordStatusType == RecordStatusType.UPDATE) {
            DefaultValueSetterBaseDto.setDefaultValue(dto, RecordStatusType.UPDATE, null);
        }

        UserEntity entity = usersRepository.save(toEntity(dto));
        dto.setId(entity.getId());

        return toDto(entity);
    }

    @Override
    public UserDto getById(Integer id) {

        UserEntity entity = usersRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanici bulunamadi: " + id));

        return toDto(entity);
    }

    @Override
    public List<UserDto> getAll(String requesterRole, String businessCode) {
        return usersRepository.findAll()
                .stream()
                .map(this::toDto)
                .filter(dto -> canAccess(dto, requesterRole, businessCode))
                .toList();
    }

    @Override
    public void delete(Integer id, String requesterRole, String businessCode) {

        ensureSameBusiness(getById(id), requesterRole, businessCode);
        usersRepository.deleteById(id);
    }




    private UserDto toDto(UserEntity entity) {
        return UserMapper.INSTANCE.toDto(entity);
    }

    private UserEntity toEntity(UserDto dto) {
        return UserMapper.INSTANCE.toEntity(dto);
    }

    private void applyRequesterBusiness(UserDto dto, String requesterRole, String businessCode) {
        String normalizedBusinessCode = normalizeBusinessCode(businessCode);
        if (!isAdmin(requesterRole)) {
            if (normalizedBusinessCode == null) {
                throw new com.wise.core.exceptions.BadRequestException("Isletme kodu bulunamadi.");
            }
            if (dto.getRoleName() != UserRole.WAITER && dto.getRoleName() != UserRole.CASHIER) {
                throw new com.wise.core.exceptions.BadRequestException("Mudur sadece garson veya kasiyer ekleyebilir.");
            }
            dto.setBusinessCode(normalizedBusinessCode);
            return;
        }
        dto.setBusinessCode(normalizeBusinessCode(dto.getBusinessCode()));
    }

    private void ensureSameBusiness(UserDto dto, String requesterRole, String businessCode) {
        if (!canAccess(dto, requesterRole, businessCode)) {
            throw new com.wise.core.exceptions.BadRequestException("Bu isletmedeki kullaniciya erisim yetkiniz yok.");
        }
    }

    private boolean canAccess(UserDto dto, String requesterRole, String businessCode) {
        if (isAdmin(requesterRole)) {
            return true;
        }
        String normalizedBusinessCode = normalizeBusinessCode(businessCode);
        return normalizedBusinessCode != null && normalizedBusinessCode.equalsIgnoreCase(dto.getBusinessCode());
    }

    private boolean isAdmin(String requesterRole) {
        return requesterRole != null && UserRole.ADMIN.getValue().equalsIgnoreCase(requesterRole.trim());
    }

    private String normalizeBusinessCode(String businessCode) {
        return businessCode == null || businessCode.isBlank() ? null : businessCode.trim().toUpperCase(Locale.ROOT);
    }
}
