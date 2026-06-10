package com.ailms.course.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record LessonRequest(
        @NotNull Long moduleId,
        
        @NotBlank String title,
        
        String videoUrl,
        
        String resourceUrl,
        
        @NotNull Integer lessonOrder,
        
        @Positive Integer durationMinutes
) {
}
