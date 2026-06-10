package com.ailms.exam.dto;

public record QuizResponse(
        Long id,
        Long courseId,
        String title,
        Integer durationMinutes,
        Integer passPercentage,
        boolean active
) {
}
