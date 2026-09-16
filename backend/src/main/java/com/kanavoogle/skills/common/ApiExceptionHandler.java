package com.kanavoogle.skills.common;

import java.time.Instant;
import java.util.Map;

import org.springframework.http.*;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<?> validation(MethodArgumentNotValidException e) {
        String m = e.getBindingResult().getFieldErrors().stream().findFirst().map(f -> f.getField() + ": " + f.getDefaultMessage()).orElse("Invalid request");
        return out(HttpStatus.BAD_REQUEST, m);
    }

    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    ResponseEntity<?> bad(RuntimeException e) {
        return out(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    @ExceptionHandler(BadCredentialsException.class)
    ResponseEntity<?> auth(BadCredentialsException e) {
        return out(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    @ExceptionHandler(SecurityException.class)
    ResponseEntity<?> sec(SecurityException e) {
        return out(HttpStatus.FORBIDDEN, "Access denied");
    }

    private ResponseEntity<?> out(HttpStatus s, String m) {
        return ResponseEntity.status(s).body(Map.of("timestamp", Instant.now(), "status", s.value(), "message", m));
    }
}
