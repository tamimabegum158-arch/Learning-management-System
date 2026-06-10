package com.ailms.exam.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateQuizRequest(
        @NotNull(message = "Course id is required")
        Long courseId,

        @NotBlank(message = "Quiz title is required")
        @Size(max = 160, message = "Title must not exceed 160 characters")
        String title,

        @NotNull(message = "Duration is required")
        @Min(value = 1, message = "Duration must be at least 1 minute")
        @Max(value = 180, message = "Duration cannot exceed 180 minutes")
        Integer durationMinutes,

        @NotNull(message = "Pass percentage is required")
        @Min(value = 1, message = "Pass percentage must be at least 1")
        @Max(value = 100, message = "Pass percentage cannot exceed 100")
        Integer passPercentage
) {
}
