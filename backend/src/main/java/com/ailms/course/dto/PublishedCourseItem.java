package com.ailms.course.dto;

import com.ailms.course.enums.CourseLevel;
import com.ailms.course.enums.CourseStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PublishedCourseItem(
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
        Double averageRating,
        long reviewCount,
        boolean inWishlist
) {
}
