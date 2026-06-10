package com.ailms.enrollment.dto;

import java.time.LocalDateTime;

public record EnrollmentResponse(
        Long enrollmentId,
        Long studentId,
        Long courseId,
        String courseTitle,
        Double progressPercentage,
        LocalDateTime enrolledAt
) {
}
