package com.userservice.controllers;


import com.userservice.models.QueryResponse;
import com.userservice.models.UserDto;
import com.userservice.services.UsersService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.Serializable;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UsersController {

    private final UsersService usersService;

    @PostMapping("")
    public ResponseEntity<QueryResponse<UserDto>> create(@RequestBody UserDto dto) {
        UserDto returnDto = new UserDto();
        returnDto.setId(usersService.create(dto).getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createQueryResponse(returnDto));
    }

    @PutMapping
    public ResponseEntity<QueryResponse<UserDto>> update(@RequestBody UserDto dto) {
        UserDto returnDto = new UserDto();
        returnDto.setId(usersService.update(dto).getId());
        return ResponseEntity.ok(createQueryResponse(returnDto));
    }


    @GetMapping("/{id}")
    public ResponseEntity<QueryResponse<UserDto>> getById(@PathVariable("id") Integer id) {
        UserDto dto = usersService.getById(id);
        if (dto == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(createQueryResponse(dto));
    }







    private <T extends Serializable> QueryResponse<T> createQueryResponse(T data) {
        QueryResponse<T> queryResponse = new QueryResponse<>();
        queryResponse.setData(data);
        return queryResponse;
    }
}
