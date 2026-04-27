package com.orderservice.controllers;

import com.orderservice.models.DashboardSummaryDto;
import com.orderservice.models.OrderDto;
import com.orderservice.services.OrderService;
import com.wise.core.enums.OrderStatus;
import com.wise.core.enums.PaymentMethod;
import com.wise.core.enums.PaymentStatus;
import com.wise.core.models.QueryResponse;
import com.wise.core.models.QueryResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
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
        return ResponseEntity.status(HttpStatus.CREATED).body(createOrderResponse(returnDto));
    }

    @PutMapping("")
    public ResponseEntity<QueryResponse<OrderDto>> update(@RequestBody OrderDto dto) {
        OrderDto returnDto = orderService.update(dto);
        return ResponseEntity.ok(createOrderResponse(returnDto));
    }

    @PatchMapping("/{id}/status/{status}")
    public ResponseEntity<QueryResponse<OrderDto>> updateStatus(
            @PathVariable("id") Integer id,
            @PathVariable("status") OrderStatus status) {
        return ResponseEntity.ok(createOrderResponse(orderService.updateStatus(id, status)));
    }

    @PatchMapping("/{id}/payment-status/{paymentStatus}")
    public ResponseEntity<QueryResponse<OrderDto>> updatePaymentStatus(
            @PathVariable("id") Integer id,
            @PathVariable("paymentStatus") PaymentStatus paymentStatus) {
        return ResponseEntity.ok(createOrderResponse(orderService.updatePaymentStatus(id, paymentStatus)));
    }

    @PatchMapping("/{id}/close/{paymentMethod}")
    public ResponseEntity<QueryResponse<OrderDto>> close(
            @PathVariable("id") Integer id,
            @PathVariable("paymentMethod") PaymentMethod paymentMethod,
            @RequestHeader(value = "X-User-Id", required = false) Integer userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        return ResponseEntity.ok(createOrderResponse(orderService.close(id, paymentMethod, userId, userRole)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QueryResponse<OrderDto>> getById(@PathVariable("id") Integer id) {
        OrderDto dto = orderService.getById(id);
        return ResponseEntity.ok(createOrderResponse(dto));
    }

    @GetMapping("")
    public ResponseEntity<QueryResponses<OrderDto>> getAll() {
        List<OrderDto> dtos = orderService.getAll();
        return ResponseEntity.ok(createOrdersResponse(dtos));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<QueryResponses<OrderDto>> getMyOrders(@RequestHeader("X-User-Id") Integer userId) {
        List<OrderDto> dtos = orderService.getByUserId(userId);
        return ResponseEntity.ok(createOrdersResponse(dtos));
    }

    @GetMapping("/active")
    public ResponseEntity<QueryResponses<OrderDto>> getActive() {
        return ResponseEntity.ok(createOrdersResponse(orderService.getActive()));
    }

    @GetMapping("/recent")
    public ResponseEntity<QueryResponses<OrderDto>> getRecent() {
        return ResponseEntity.ok(createOrdersResponse(orderService.getRecent()));
    }

    @GetMapping("/place/{placeId}/active")
    public ResponseEntity<QueryResponses<OrderDto>> getActiveByPlaceId(@PathVariable("placeId") Integer placeId) {
        List<OrderDto> dtos = orderService.getActiveByPlaceId(placeId);
        return ResponseEntity.ok(createOrdersResponse(dtos));
    }

    @GetMapping("/dashboard/summary")
    public ResponseEntity<QueryResponse<DashboardSummaryDto>> getDashboardSummary() {
        QueryResponse<DashboardSummaryDto> queryResponse = new QueryResponse<>();
        queryResponse.setData(orderService.getDashboardSummary());
        return ResponseEntity.ok(queryResponse);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<QueryResponse<String>> delete(@PathVariable("id") Integer id) {
        orderService.delete(id);
        return ResponseEntity.ok(createMessageResponse("Deleted"));
    }

    private QueryResponse<OrderDto> createOrderResponse(OrderDto data) {
        QueryResponse<OrderDto> queryResponse = new QueryResponse<>();
        queryResponse.setData(data);
        return queryResponse;
    }

    private QueryResponses<OrderDto> createOrdersResponse(List<OrderDto> data) {
        QueryResponses<OrderDto> queryResponse = new QueryResponses<>();
        queryResponse.setData(data);
        return queryResponse;
    }

    private QueryResponse<String> createMessageResponse(String data) {
        QueryResponse<String> queryResponse = new QueryResponse<>();
        queryResponse.setData(data);
        return queryResponse;
    }
}
