package com.productservice.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.productservice.models.OrderCreatedEvent;
import com.productservice.models.OrderItemEventDto;
import com.productservice.models.ProductDto;
import com.productservice.services.ProductsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderEventConsumer {

    private final ProductsService productsService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "${order.topic.name}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeOrderEvent(String message) {
        try {
            OrderCreatedEvent event = objectMapper.readValue(message, OrderCreatedEvent.class);
            log.info("Received order event: {}", event);

            List<OrderItemEventDto> items = event.getItems();
            if (items == null) {
                return;
            }

            for (OrderItemEventDto item : items) {
                Integer productId = item.getProductId();
                Integer quantity = item.getQuantity();

                ProductDto product = productsService.getById(productId);
                if (product != null && product.getStock() != null) {
                    int newStock = Math.max(0, product.getStock() - quantity);
                    product.setStock(newStock);
                    productsService.update(product);
                    log.info("Stock updated for product {}: new stock = {}", productId, newStock);
                }
            }
        } catch (JsonProcessingException e) {
            log.error("Error processing order event", e);
        } catch (Exception e) {
            log.error("Error updating stock", e);
        }
    }
}
