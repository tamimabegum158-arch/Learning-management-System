package com.ailms.ai.dto;

import com.ailms.exam.enums.QuestionDifficulty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AiQuizGenerationRequest(
        @NotNull(message = "Course id is required")
        Long courseId,

        @NotNull(message = "Difficulty is required")
        QuestionDifficulty difficulty,

        @NotNull(message = "Question count is required")
        @Min(value = 3, message = "At least 3 questions required")
        @Max(value = 20, message = "At most 20 questions allowed")
        Integer questionCount
) {
}
