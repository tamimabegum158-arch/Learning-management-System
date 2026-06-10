package com.ailms.video.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateLessonNoteRequest(
        @NotNull(message = "Timestamp is required")
        @Min(value = 0, message = "Timestamp cannot be negative")
        Integer timestampSeconds,

        @NotBlank(message = "Note text is required")
        @Size(max = 1500, message = "Note text must not exceed 1500 characters")
        String noteText
) {
}
