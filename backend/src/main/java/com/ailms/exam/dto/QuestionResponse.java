package com.ailms.exam.dto;

import com.ailms.exam.enums.QuestionDifficulty;

public record QuestionResponse(
        Long id,
        String questionText,
        String optionA,
        String optionB,
        String optionC,
        String optionD,
        QuestionDifficulty difficulty
) {
}
