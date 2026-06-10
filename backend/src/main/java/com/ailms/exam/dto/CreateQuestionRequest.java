package com.ailms.exam.dto;

import com.ailms.exam.enums.QuestionDifficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateQuestionRequest(
        @NotNull(message = "Quiz id is required")
        Long quizId,

        @NotBlank(message = "Question text is required")
        @Size(max = 1500, message = "Question text must not exceed 1500 characters")
        String questionText,

        @NotBlank(message = "Option A is required")
        @Size(max = 500, message = "Option must not exceed 500 characters")
        String optionA,

        @NotBlank(message = "Option B is required")
        @Size(max = 500, message = "Option must not exceed 500 characters")
        String optionB,

        @NotBlank(message = "Option C is required")
        @Size(max = 500, message = "Option must not exceed 500 characters")
        String optionC,

        @NotBlank(message = "Option D is required")
        @Size(max = 500, message = "Option must not exceed 500 characters")
        String optionD,

        @NotBlank(message = "Correct option is required")
        @Pattern(regexp = "A|B|C|D", message = "Correct option must be one of A/B/C/D")
        String correctOption,

        @NotNull(message = "Difficulty is required")
        QuestionDifficulty difficulty
) {
}
