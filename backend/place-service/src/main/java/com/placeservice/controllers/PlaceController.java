package com.placeservice.controllers;

import com.placeservice.models.PlaceDto;
import com.placeservice.services.PlacesService;
import com.wise.core.enums.PlaceStatus;
import com.wise.core.enums.UserRole;
import com.wise.core.models.QueryResponse;
import com.wise.core.models.QueryResponses;
import com.wise.core.security.RequiredRole;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
        return ResponseEntity.ok(createQueryResponse(dto));
    }

    @GetMapping("")
    public ResponseEntity<QueryResponses<PlaceDto>> getAll() {
        return ResponseEntity.ok(createQueryResponses(placesService.getAll()));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<QueryResponses<PlaceDto>> getByStatus(@PathVariable("status") PlaceStatus status) {
        return ResponseEntity.ok(createQueryResponses(placesService.getByStatus(status)));
    }

    @PatchMapping("/{id}/status/{status}")
    public ResponseEntity<QueryResponse<PlaceDto>> updateStatus(
            @PathVariable("id") Integer id,
            @PathVariable("status") PlaceStatus status) {
        PlaceDto dto = placesService.updateStatus(id, status);
        return ResponseEntity.ok(createQueryResponse(dto));
    }

    @PatchMapping("/{id}/close")
    public ResponseEntity<QueryResponse<PlaceDto>> close(@PathVariable("id") Integer id) {
        PlaceDto dto = placesService.close(id);
        return ResponseEntity.ok(createQueryResponse(dto));
    }

    @RequiredRole(UserRole.ADMIN)
    @DeleteMapping("/{id}")
    public ResponseEntity<QueryResponse<String>> delete(@PathVariable("id") Integer id) {
        QueryResponse<String> queryResponse = new QueryResponse<>();
        placesService.delete(id);
        return ResponseEntity.status(HttpStatus.OK).body(queryResponse);
    }

    private <T> QueryResponse<T> createQueryResponse(T data) {
        QueryResponse<T> queryResponse = new QueryResponse<>();
        queryResponse.setData(data);
        return queryResponse;
    }

    private QueryResponses<PlaceDto> createQueryResponses(List<PlaceDto> data) {
        QueryResponses<PlaceDto> queryResponse = new QueryResponses<>();
        queryResponse.setData(data);
        return queryResponse;
    }

}
