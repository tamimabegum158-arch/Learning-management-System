package com.ailms.exam.dto;

import com.ailms.exam.enums.ExamAttemptStatus;
import java.time.LocalDateTime;

public record ExamResultResponse(
        Long attemptId,
        Long quizId,
        ExamAttemptStatus status,
        Integer totalQuestions,
        Integer attemptedQuestions,
        Integer correctAnswers,
        Double scorePercentage,
        boolean passed,
        String certificateCode,
        LocalDateTime submittedAt
) {
}
