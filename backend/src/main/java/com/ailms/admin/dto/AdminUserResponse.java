package com.ailms.admin.dto;

public record AdminUserResponse(
        Long id,
        String fullName,
        String email,
        String role,
        boolean enabled,
        boolean accountNonLocked
) {
}
