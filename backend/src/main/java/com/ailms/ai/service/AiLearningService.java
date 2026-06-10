package com.ailms.ai.service;

import com.ailms.ai.dto.AiChatRequest;
import com.ailms.ai.dto.AiChatResponse;
import com.ailms.ai.dto.AiQuizGenerationRequest;
import com.ailms.ai.dto.AiStudyPlanRequest;
import com.ailms.ai.dto.AiStudyPlanResponse;

public interface AiLearningService {
    AiStudyPlanResponse generateStudyPlan(AiStudyPlanRequest request, String studentEmail);
    String generateQuizQuestions(AiQuizGenerationRequest request, String instructorEmail);
    AiChatResponse chat(AiChatRequest request, String userEmail);
}
