package com.ailms.course.dto;

import java.util.List;

public record ModuleResponse(
        Long id,
        Long courseId,
        String title,
        Integer moduleOrder,
        List<LessonResponse> lessons,
        Integer totalLessons,
        Integer totalDurationMinutes
) {
}
