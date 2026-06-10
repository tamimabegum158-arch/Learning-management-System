package com.ailms.ai.dto;

import java.time.LocalDate;

public record AiStudyPlanResponse(
        Long studyPlanId,
        String goal,
        Integer dailyFreeTimeMinutes,
        LocalDate examDate,
        String generatedPlan
) {
}
