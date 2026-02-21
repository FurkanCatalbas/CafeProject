package com.userservice.services;

import com.userservice.enums.RecordStatusType;
import com.userservice.mappers.UserMapper;
import com.userservice.models.DefaultValueSetterBaseDto;
import com.userservice.models.UserDto;
import com.userservice.models.UserEntity;
import com.userservice.repository.UsersRepository;
import com.userservice.validators.UserSaveValidator;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
        if (getById(userDto.getId()) == null) {
           // throw new CustomResourceNotFoundException("UserEntity not found");
        }
        return saveOrUpdate(RecordStatusType.UPDATE, userDto);
    }

    private UserDto saveOrUpdate(RecordStatusType recordStatusType,UserDto dto) {
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
                .orElse(null);

        return toDto(entity);
    }




    private UserDto toDto(UserEntity entity) {
        return UserMapper.INSTANCE.toDto(entity);
    }

    private UserEntity toEntity(UserDto dto) {
        return UserMapper.INSTANCE.toEntity(dto);
    }
}
