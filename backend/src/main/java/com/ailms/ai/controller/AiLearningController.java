package com.ailms.ai.controller;

import com.ailms.ai.dto.AiChatRequest;
import com.ailms.ai.dto.AiChatResponse;
import com.ailms.ai.dto.AiQuizGenerationRequest;
import com.ailms.ai.dto.AiStudyPlanRequest;
import com.ailms.ai.dto.AiStudyPlanResponse;
import com.ailms.ai.service.AiLearningService;
import com.ailms.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/ai")
@RequiredArgsConstructor
public class AiLearningController {

    private final AiLearningService aiLearningService;

    @PostMapping("/study-plan")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<AiStudyPlanResponse>> generateStudyPlan(
            @Valid @RequestBody AiStudyPlanRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "AI study plan generated successfully",
                aiLearningService.generateStudyPlan(request, authentication.getName())
        ));
    }

    @PostMapping("/quiz-generator")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<String>> generateQuiz(
            @Valid @RequestBody AiQuizGenerationRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "AI quiz generated successfully",
                aiLearningService.generateQuizQuestions(request, authentication.getName())
        ));
    }

    @PostMapping("/chat")
    @PreAuthorize("hasAnyRole('STUDENT','INSTRUCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<AiChatResponse>> chat(
            @Valid @RequestBody AiChatRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "AI response generated successfully",
                aiLearningService.chat(request, authentication.getName())
        ));
    }
}
