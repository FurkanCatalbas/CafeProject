package com.wise.core.exceptions;

import com.wise.core.enums.OutcomeType;
import com.wise.core.models.QueryResponse;
import com.wise.core.models.UIMessage;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<QueryResponse<Void>> handleResourceNotFound(ResourceNotFoundException exception) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, exception.getMessage());
    }

    @ExceptionHandler({
            BadRequestException.class,
            IllegalArgumentException.class,
            MethodArgumentNotValidException.class,
            MethodArgumentTypeMismatchException.class
    })
    public ResponseEntity<QueryResponse<Void>> handleBadRequest(Exception exception) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, exception.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<QueryResponse<Void>> handleUnexpected(Exception exception) {
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Beklenmeyen bir hata olustu.");
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
}
