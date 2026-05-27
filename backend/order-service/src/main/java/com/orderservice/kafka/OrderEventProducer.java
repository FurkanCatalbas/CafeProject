package com.orderservice.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.orderservice.models.OrderCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderEventProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${order.topic.name}")
    private String orderTopicName;

    @Async
    public void sendOrderCreatedEvent(OrderCreatedEvent event) {
        try {
            String message = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(orderTopicName, event.getOrderId().toString(), message);
            log.info("Order created event sent: {}", event.getOrderId());
        } catch (JsonProcessingException e) {
            log.error("Error serializing order event", e);
        } catch (Exception e) {
            log.warn("Could not send Kafka event (Kafka might be down): {}", e.getMessage());
        }
    }
}