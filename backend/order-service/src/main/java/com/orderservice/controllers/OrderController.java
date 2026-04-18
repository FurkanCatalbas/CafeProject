package com.orderservice.controllers;

import com.orderservice.models.OrderDto;
import com.orderservice.services.OrderService;
import com.wise.core.models.QueryResponse;
import com.wise.core.models.QueryResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("")
    public ResponseEntity<QueryResponse<OrderDto>> create(@RequestBody OrderDto dto, @RequestHeader("X-User-Id") Integer userId) {
        OrderDto returnDto = orderService.create(dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createQueryResponse(returnDto));
    }

    @PutMapping("")
    public ResponseEntity<QueryResponse<OrderDto>> update(@RequestBody OrderDto dto) {
        OrderDto returnDto = orderService.update(dto);
        if (returnDto == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(createQueryResponse(returnDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QueryResponse<OrderDto>> getById(@PathVariable("id") Integer id) {
        OrderDto dto = orderService.getById(id);
        if (dto == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(createQueryResponse(dto));
    }

    @GetMapping("")
    public ResponseEntity<QueryResponses<OrderDto>> getAll() {
        List<OrderDto> dtos = orderService.getAll();
        return ResponseEntity.ok(createQueryResponses(dtos));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<QueryResponses<OrderDto>> getMyOrders(@RequestHeader("X-User-Id") Integer userId) {
        List<OrderDto> dtos = orderService.getByUserId(userId);
        return ResponseEntity.ok(createQueryResponses(dtos));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<QueryResponse<String>> delete(@PathVariable("id") Integer id) {
        orderService.delete(id);
        return ResponseEntity.ok(createQueryResponse("Deleted"));
    }

    private <T> QueryResponse<T> createQueryResponse(T data) {
        QueryResponse<T> queryResponse = new QueryResponse<>();
        queryResponse.setData(data);
        return queryResponse;
    }
    private <T> QueryResponses<T> createQueryResponses(List<T> data) {
        QueryResponses<T> queryResponse = new QueryResponses<>();
        queryResponse.setData(data);
        return queryResponse;
    }
}
