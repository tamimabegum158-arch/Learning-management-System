package com.ailms.exam.dto;

import java.time.LocalDateTime;
import java.util.List;

public record StartAttemptResponse(
        Long attemptId,
        Long quizId,
        String quizTitle,
        Integer durationMinutes,
        LocalDateTime startedAt,
        LocalDateTime endsAt,
        List<QuestionResponse> questions
) {
}
