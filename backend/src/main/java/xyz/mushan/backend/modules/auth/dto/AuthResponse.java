package xyz.mushan.backend.modules.auth.dto;

import java.io.Serializable;

public record AuthResponse(String token) implements Serializable {}