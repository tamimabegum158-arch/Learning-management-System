package com.ailms.video.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateLessonProgressRequest(
        @NotNull(message = "Watched seconds is required")
        @Min(value = 0, message = "Watched seconds cannot be negative")
        Integer watchedSeconds,

        @NotNull(message = "Completion percentage is required")
        @Min(value = 0, message = "Completion must be at least 0")
        @Max(value = 100, message = "Completion cannot exceed 100")
        Double completionPercentage
) {
}
