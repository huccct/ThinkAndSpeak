package xyz.mushan.backend.common.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import xyz.mushan.backend.common.base.ApiResponse;
import xyz.mushan.backend.common.base.ErrorCode;

/**
 * @author mushan
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .findFirst().map(e -> e.getField() + ": " + e.getDefaultMessage())
                .orElse("Validation failed");
        log.error(msg, ex);
        return new ResponseEntity<>(ApiResponse.failure(ErrorCode.BAD_REQUEST.getCode(), msg), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<ApiResponse<Void>> handleBind(BindException ex) {
        String msg = ex.getAllErrors().stream().findFirst().map(DefaultMessageSourceResolvable::getDefaultMessage).orElse("Bad Request");
        log.error(msg, ex);
        return new ResponseEntity<>(ApiResponse.failure(ErrorCode.BAD_REQUEST.getCode(), msg), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<ApiResponse<Void>> handleSecurity(SecurityException ex) {
        return new ResponseEntity<>(ApiResponse.failure(ErrorCode.UNAUTHORIZED.getCode(), ex.getMessage()),
                HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneric(Exception ex) {
        log.error("系统异常", ex);
        return new ResponseEntity<>(ApiResponse.failure(ErrorCode.INTERNAL_ERROR), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
