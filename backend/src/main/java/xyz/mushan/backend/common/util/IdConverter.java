package xyz.mushan.backend.common.util;

public final class IdConverter {
    private IdConverter() {
    }

    public static Long parse(String id) {
        if (id == null) {
            throw new IllegalArgumentException("id is null");
        }
        String trimmed = id.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("id is blank");
        }
        if (!trimmed.matches("\\d{1,19}")) {
            throw new IllegalArgumentException("id must be numeric up to 19 digits");
        }
        return Long.parseLong(trimmed);
    }
}
