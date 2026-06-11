package com.authservice.controllers;

import com.wise.core.enums.OutcomeType;
import com.wise.core.exceptions.BadRequestException;
import com.wise.core.exceptions.ResourceNotFoundException;
import com.wise.core.models.QueryResponse;
import com.wise.core.models.UIMessage;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class AuthExceptionHandler {

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<QueryResponse<Void>> handleBadRequest(BadRequestException ex) {
        return buildError(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<QueryResponse<Void>> handleNotFound(ResourceNotFoundException ex) {
        return buildError(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<QueryResponse<Void>> handleUnexpected(Exception ex) {
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR, "Beklenmeyen bir hata olustu.");
    }

    private ResponseEntity<QueryResponse<Void>> buildError(HttpStatus status, String message) {
        QueryResponse<Void> response = new QueryResponse<>();
        response.setOutcomeType(OutcomeType.error);
        UIMessage uiMessage = new UIMessage();
        uiMessage.setCode(status.value());
        uiMessage.setText(message);
        response.setUiMessage(uiMessage);
        return ResponseEntity.status(status).body(response);
    }
}
