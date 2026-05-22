package com.orderservice.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.orderservice.models.OrderCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.support.SendResult;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderEventProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${order.topic.name}")
    private String orderTopicName;

    private static final long SEND_TIMEOUT_SECONDS = 10;

    public void sendOrderCreatedEvent(OrderCreatedEvent event) {
        try {
            String message = objectMapper.writeValueAsString(event);
            SendResult<String, String> sendResult = kafkaTemplate
                    .send(orderTopicName, event.getOrderId().toString(), message)
                    .get(SEND_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            log.info(
                    "Order created event sent: {} topic={} partition={} offset={}",
                    event.getOrderId(),
                    sendResult.getRecordMetadata().topic(),
                    sendResult.getRecordMetadata().partition(),
                    sendResult.getRecordMetadata().offset()
            );
        } catch (JsonProcessingException e) {
            log.error("Error serializing order event", e);
            throw new RuntimeException("Error serializing order event", e);
        } catch (Exception e) {
            log.error("Error sending order event for order {}", event.getOrderId(), e);
            throw new RuntimeException("Order event gonderilemedi, siparis geri alindi.", e);
        }
    }
}
