package com.ailms.course.dto;

import java.time.LocalDateTime;

public record CourseReviewResponse(
        Long id,
        Long courseId,
        Long studentId,
        String studentName,
        Integer rating,
        String comment,
        LocalDateTime createdAt
) {
}
