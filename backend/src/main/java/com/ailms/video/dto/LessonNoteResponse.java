package com.ailms.video.dto;

import java.time.LocalDateTime;

public record LessonNoteResponse(
        Long id,
        Long lessonId,
        Integer timestampSeconds,
        String noteText,
        LocalDateTime createdAt
) {
}
