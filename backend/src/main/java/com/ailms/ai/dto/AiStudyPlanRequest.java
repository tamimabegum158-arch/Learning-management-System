package com.ailms.ai.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record AiStudyPlanRequest(
        @NotNull(message = "Daily free time is required")
        @Min(value = 30, message = "Daily free time must be at least 30 minutes")
        Integer dailyFreeTimeMinutes,

        @NotBlank(message = "Goal is required")
        String goal,

        @NotNull(message = "Exam date is required")
        LocalDate examDate
) {
}
