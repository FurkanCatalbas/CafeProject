package com.authservice.controllers;

import com.authservice.mappers.UserMapper;
import com.authservice.models.UserDto;
import com.authservice.models.UserEntity;
import com.authservice.repositorys.UserRepository;
import com.wise.core.exceptions.BadRequestException;
import com.wise.core.exceptions.ResourceNotFoundException;
import com.wise.core.models.QueryResponse;
import com.wise.core.models.QueryResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<QueryResponses<UserDto>> getAll() {
        requireManagerOrAdmin();
        List<UserDto> users = userRepository.findAll().stream()
                .map(e -> {
                    UserDto dto = UserMapper.INSTANCE.toDto(e);
                    dto.setPassword(null);
                    return dto;
                })
                .toList();
        QueryResponses<UserDto> response = new QueryResponses<>();
        response.setData(users);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<QueryResponse<UserDto>> create(@RequestBody UserDto dto) {
        requireManagerOrAdmin();
        if (dto.getUsername() == null || dto.getUsername().isBlank())
            throw new BadRequestException("Kullanici adi zorunludur.");
        if (dto.getPassword() == null || dto.getPassword().isBlank())
            throw new BadRequestException("Sifre zorunludur.");
        if (dto.getRoleName() == null)
            throw new BadRequestException("Rol zorunludur.");
        dto.setId(null);
        if (dto.getType() == null) dto.setType(1);
        dto.setPassword(passwordEncoder.encode(dto.getPassword()));
        UserEntity entity = userRepository.save(UserMapper.INSTANCE.toEntity(dto));
        UserDto result = UserMapper.INSTANCE.toDto(entity);
        result.setPassword(null);
        QueryResponse<UserDto> response = new QueryResponse<>();
        response.setData(result);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<QueryResponse<UserDto>> update(@PathVariable Integer id, @RequestBody UserDto dto) {
        requireManagerOrAdmin();
        UserEntity existing = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanici bulunamadi: " + id));
        dto.setId(id);
        if (dto.getType() == null) dto.setType(existing.getType());
        if (dto.getPassword() == null || dto.getPassword().isBlank()) {
            dto.setPassword(existing.getPassword());
        } else {
            dto.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        UserEntity entity = userRepository.save(UserMapper.INSTANCE.toEntity(dto));
        UserDto result = UserMapper.INSTANCE.toDto(entity);
        result.setPassword(null);
        QueryResponse<UserDto> response = new QueryResponse<>();
        response.setData(result);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        requireManagerOrAdmin();
        userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanici bulunamadi: " + id));
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @SuppressWarnings("unchecked")
    private void requireManagerOrAdmin() {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal instanceof Map<?, ?> map) {
                String role = (String) map.get("role");
                if ("MANAGER".equals(role) || "ADMIN".equals(role)) return;
            }
        } catch (Exception ignored) {}
        throw new BadRequestException("Bu islemi yapmak icin yetkiniz yok. (MANAGER veya ADMIN gerekli)");
    }
}
