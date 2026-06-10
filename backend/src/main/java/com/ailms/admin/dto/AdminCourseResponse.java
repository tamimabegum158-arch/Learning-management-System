package com.ailms.admin.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AdminCourseResponse(
        Long id,
        String title,
        String status,
        boolean active,
        BigDecimal price,
        Long instructorId,
        String instructorName,
        LocalDateTime createdAt
) {
}
