package com.ailms.course.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ModuleRequest(
        @NotNull Long courseId,
        
        @NotBlank String title,
        
        @NotNull Integer moduleOrder
) {
}
