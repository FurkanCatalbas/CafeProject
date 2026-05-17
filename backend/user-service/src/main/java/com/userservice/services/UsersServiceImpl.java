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

@Service
@RequiredArgsConstructor
public class UsersServiceImpl implements UsersService {

    private final UsersRepository usersRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserSaveValidator userSaveValidator;
    private final EntityManager entityManager;

    @Override
    public UserDto create(UserDto userDto) {
        userDto.setId(null);
        return saveOrUpdate(RecordStatusType.CREATE, userDto);
    }

    @Override
    public UserDto update(UserDto userDto) {
        getById(userDto.getId());
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
    public List<UserDto> getAll() {
        return usersRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public void delete(Integer id) {

        getById(id);
        usersRepository.deleteById(id);
    }




    private UserDto toDto(UserEntity entity) {
        return UserMapper.INSTANCE.toDto(entity);
    }

    private UserEntity toEntity(UserDto dto) {
        return UserMapper.INSTANCE.toEntity(dto);
    }
}
