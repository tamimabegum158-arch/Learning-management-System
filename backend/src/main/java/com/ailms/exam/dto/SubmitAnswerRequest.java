package com.ailms.exam.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record SubmitAnswerRequest(
        @NotNull(message = "Question id is required")
        Long questionId,

        @NotBlank(message = "Selected option is required")
        @Pattern(regexp = "A|B|C|D", message = "Selected option must be one of A/B/C/D")
        String selectedOption
) {
}
