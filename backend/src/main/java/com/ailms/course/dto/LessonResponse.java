package com.ailms.course.dto;

import java.time.LocalDateTime;

public record LessonResponse(
        Long id,
        Long moduleId,
        Long courseId,
        String title,
        String videoUrl,
        String resourceUrl,
        Integer lessonOrder,
        Integer durationMinutes,
        LocalDateTime createdAt
) {
}
