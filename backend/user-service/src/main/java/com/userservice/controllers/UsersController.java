package com.userservice.controllers;


import com.wise.core.enums.UserRole;
import com.wise.core.models.QueryResponse;
import com.userservice.models.UserDto;
import com.userservice.services.UsersService;
import com.wise.core.security.RequiredRole;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UsersController {

    private final UsersService usersService;

    @RequiredRole({UserRole.ADMIN, UserRole.MANAGER})
    @PostMapping("")
    public ResponseEntity<QueryResponse<UserDto>> create(
            @RequestBody UserDto dto,
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole,
            @RequestHeader(value = "X-Business-Code", required = false) String businessCode) {
        UserDto returnDto = new UserDto();
        returnDto.setId(usersService.create(dto, requesterRole, businessCode).getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createQueryResponse(returnDto));
    }

    @RequiredRole({UserRole.ADMIN, UserRole.MANAGER})
    @PutMapping
    public ResponseEntity<QueryResponse<UserDto>> update(
            @RequestBody UserDto dto,
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole,
            @RequestHeader(value = "X-Business-Code", required = false) String businessCode) {
        UserDto returnDto = new UserDto();
        returnDto.setId(usersService.update(dto, requesterRole, businessCode).getId());
        return ResponseEntity.ok(createQueryResponse(returnDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QueryResponse<UserDto>> getById(@PathVariable("id") Integer id) {
        UserDto dto = usersService.getById(id);
        return ResponseEntity.ok(createQueryResponse(dto));
    }

    @GetMapping("")
    public ResponseEntity<QueryResponse<List<UserDto>>> getAll(
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole,
            @RequestHeader(value = "X-Business-Code", required = false) String businessCode) {
        return ResponseEntity.ok(createQueryResponse(usersService.getAll(requesterRole, businessCode)));
    }
    @RequiredRole({UserRole.ADMIN, UserRole.MANAGER})
    @DeleteMapping("/{id}")
    public ResponseEntity<QueryResponse<String>> delete(
            @PathVariable("id") Integer id,
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole,
            @RequestHeader(value = "X-Business-Code", required = false) String businessCode) {
        QueryResponse<String> queryResponse = new QueryResponse<>();
        usersService.delete(id, requesterRole, businessCode);
        return ResponseEntity.status(HttpStatus.OK).body(queryResponse);
    }

    private <T> QueryResponse<T> createQueryResponse(T data) {
        QueryResponse<T> queryResponse = new QueryResponse<>();
        queryResponse.setData(data);
        return queryResponse;
    }
}
