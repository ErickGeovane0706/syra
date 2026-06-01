package com.syra.config;

public class CalendarIntegrationException extends RuntimeException {
    public CalendarIntegrationException(String message) {
        super(message);
    }

    public CalendarIntegrationException(String message, Throwable cause) {
        super(message, cause);
    }
}
