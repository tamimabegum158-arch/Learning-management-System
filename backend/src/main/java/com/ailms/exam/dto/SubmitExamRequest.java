package com.ailms.exam.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record SubmitExamRequest(
        @NotEmpty(message = "Answers are required")
        List<@Valid SubmitAnswerRequest> answers
) {
}
