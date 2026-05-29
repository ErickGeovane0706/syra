package com.syra.controller;

import com.syra.config.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public ResponseEntity<ErrorResponse> handleError(HttpServletRequest request) {
        Object status = request.getAttribute("jakarta.servlet.error.status_code");
        Object exceptionMessage = request.getAttribute("jakarta.servlet.error.message");
        Object exception = request.getAttribute("jakarta.servlet.error.exception");

        int statusCode = status != null ? Integer.parseInt(status.toString()) : 500;
        String message = exceptionMessage != null ? exceptionMessage.toString() : "Erro desconhecido";
        String error = exception != null ? exception.getClass().getSimpleName() : "Erro no servidor";

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(statusCode)
                .message(message)
                .error(error)
                .build();

        return ResponseEntity.status(statusCode).body(errorResponse);
    }
}

