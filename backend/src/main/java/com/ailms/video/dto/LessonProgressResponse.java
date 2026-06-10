package com.ailms.video.dto;

import java.time.LocalDateTime;

public record LessonProgressResponse(
        Long lessonId,
        String lessonTitle,
        Integer watchedSeconds,
        Double completionPercentage,
        boolean completed,
        LocalDateTime updatedAt
) {
}
