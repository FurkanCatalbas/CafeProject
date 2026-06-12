package com.productservice.controllers;

import com.productservice.models.ProductDto;
import com.productservice.services.ProductsService;
import com.wise.core.enums.UserRole;
import com.wise.core.models.QueryResponse;
import com.wise.core.security.RequiredRole;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductsService productsService;

    @PostMapping("")
    public ResponseEntity<QueryResponse<ProductDto>> create(
            @RequestBody ProductDto dto,
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole,
            @RequestHeader(value = "X-Business-Code", required = false) String businessCode) {
        ProductDto created = productsService.create(dto, requesterRole, businessCode);
        ProductDto returnDto = new ProductDto();
        returnDto.setId(created.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createQueryResponse(returnDto));
    }

    @PutMapping("")
    public ResponseEntity<QueryResponse<ProductDto>> update(
            @RequestBody ProductDto dto,
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole,
            @RequestHeader(value = "X-Business-Code", required = false) String businessCode) {
        ProductDto updated = productsService.update(dto, requesterRole, businessCode);
        ProductDto returnDto = new ProductDto();
        returnDto.setId(updated.getId());
        return ResponseEntity.ok(createQueryResponse(returnDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QueryResponse<ProductDto>> getById(@PathVariable("id") Integer id) {
        ProductDto dto = productsService.getById(id);
        return ResponseEntity.ok(createQueryResponse(dto));
    }

    @GetMapping("")
    public ResponseEntity<QueryResponse<List<ProductDto>>> getAll(
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole,
            @RequestHeader(value = "X-Business-Code", required = false) String businessCode) {
        List<ProductDto> dtos = productsService.getAll(requesterRole, businessCode);
        return ResponseEntity.ok(createQueryResponse(dtos));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<QueryResponse<List<ProductDto>>> getByCategory(
            @PathVariable("category") String category,
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole,
            @RequestHeader(value = "X-Business-Code", required = false) String businessCode) {
        List<ProductDto> dtos = productsService.getByCategory(category, requesterRole, businessCode);
        return ResponseEntity.ok(createQueryResponse(dtos));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<QueryResponse<String>> delete(
            @PathVariable("id") Integer id,
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole,
            @RequestHeader(value = "X-Business-Code", required = false) String businessCode) {
        // Authorization is handled in the service layer if necessary
        productsService.delete(id);
        return ResponseEntity.ok(createQueryResponse("Deleted"));
    }

    private <T> QueryResponse<T> createQueryResponse(T data) {
        QueryResponse<T> queryResponse = new QueryResponse<>();
        queryResponse.setData(data);
        return queryResponse;
    }
}
