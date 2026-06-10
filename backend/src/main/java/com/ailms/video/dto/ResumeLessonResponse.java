package com.ailms.video.dto;

public record ResumeLessonResponse(
        Long lessonId,
        String lessonTitle,
        Integer resumeFromSeconds,
        Double completionPercentage
) {
}
