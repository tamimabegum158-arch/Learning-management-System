package com.ailms.course.dto;

import com.ailms.course.enums.CourseLevel;
import com.ailms.course.enums.CourseStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CourseResponse(
        Long id,
        String title,
        String description,
        BigDecimal price,
        CourseLevel level,
        CourseStatus status,
        Long instructorId,
        String instructorName,
        boolean active,
        LocalDateTime createdAt,
        Integer totalEnrollments,
        Double averageRating,
        Long reviewCount
) {
}
