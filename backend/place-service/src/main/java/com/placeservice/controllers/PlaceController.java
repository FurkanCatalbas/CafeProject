package com.placeservice.controllers;

import com.placeservice.models.PlaceDto;
import com.placeservice.services.PlacesService;
import com.wise.core.models.QueryResponse;
import com.wise.core.security.RequiredRole;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.Serializable;

@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class PlaceController {
    
    private final PlacesService placesService;

    @PostMapping("")
    public ResponseEntity<QueryResponse<PlaceDto>> create(@RequestBody PlaceDto dto) {
        PlaceDto returnDto = new PlaceDto();
        returnDto.setId(placesService.create(dto).getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createQueryResponse(returnDto));
    }

    @PutMapping
    public ResponseEntity<QueryResponse<PlaceDto>> update(@RequestBody PlaceDto dto) {
        PlaceDto returnDto = new PlaceDto();
        returnDto.setId(placesService.update(dto).getId());
        return ResponseEntity.ok(createQueryResponse(returnDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QueryResponse<PlaceDto>> getById(@PathVariable("id") Integer id) {
        PlaceDto dto = placesService.getById(id);
        if (dto == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(createQueryResponse(dto));
    }
    @RequiredRole("ADMIN")
    @DeleteMapping("/{id}")
    public ResponseEntity<QueryResponse<String>> delete(@PathVariable("id") Integer id) {
        QueryResponse<String> queryResponse = new QueryResponse<>();
        placesService.delete(id);
        return ResponseEntity.status(HttpStatus.OK).body(queryResponse);
    }

    private <T extends Serializable> QueryResponse<T> createQueryResponse(T data) {
        QueryResponse<T> queryResponse = new QueryResponse<>();
        queryResponse.setData(data);
        return queryResponse;
    }

}
