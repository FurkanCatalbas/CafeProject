package com.musicvoteservice.controllers;

import com.wise.core.enums.OutcomeType;
import com.wise.core.models.QueryResponse;
import com.wise.core.models.UIMessage;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.TransactionException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Order(Ordered.HIGHEST_PRECEDENCE)
@RestControllerAdvice(basePackages = "com.musicvoteservice")
public class MusicServiceExceptionHandler {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<QueryResponse<Void>> handleDataIntegrity(DataIntegrityViolationException exception) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Veri tabani kisiti nedeniyle islem tamamlanamadi: " + rootMessage(exception));
    }

    @ExceptionHandler(TransactionException.class)
    public ResponseEntity<QueryResponse<Void>> handleTransaction(TransactionException exception) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Islem tamamlanamadi: " + rootMessage(exception));
    }

    private ResponseEntity<QueryResponse<Void>> buildErrorResponse(HttpStatus status, String message) {
        QueryResponse<Void> response = new QueryResponse<>();
        response.setOutcomeType(OutcomeType.error);

        UIMessage uiMessage = new UIMessage();
        uiMessage.setCode(status.value());
        uiMessage.setText(message);
        response.setUiMessage(uiMessage);

        return ResponseEntity.status(status).body(response);
    }

    private String rootMessage(Throwable throwable) {
        Throwable current = throwable;
        while (current.getCause() != null) {
            current = current.getCause();
        }
        return current.getMessage() == null ? throwable.getMessage() : current.getMessage();
    }
}
