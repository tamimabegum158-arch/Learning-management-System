package com.ailms.auth.dto;

public record JwtAuthResponse(
        String accessToken,
        String tokenType,
        Long userId,
        String email,
        String role
) {
}
