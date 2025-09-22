package xyz.mushan.backend.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * @author mushan
 */

@Getter
@AllArgsConstructor
public enum ErrorCode {
    OK(0, "OK"),
    BAD_REQUEST(400, "Bad Request"),
    UNAUTHORIZED(401, "Unauthorized"),
    FORBIDDEN(403, "Forbidden"),
    NOT_FOUND(404, "Not Found"),
    TOO_MANY_REQUESTS(429, "Too Many Requests"),
    INTERNAL_ERROR(500, "Internal Server Error");

    private final int code;
    private final String message;

}
