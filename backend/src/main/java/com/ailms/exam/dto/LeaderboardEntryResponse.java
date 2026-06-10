package com.ailms.exam.dto;

public record LeaderboardEntryResponse(
        Long studentId,
        String studentName,
        Double scorePercentage,
        Integer correctAnswers,
        Integer totalQuestions
) {
}
