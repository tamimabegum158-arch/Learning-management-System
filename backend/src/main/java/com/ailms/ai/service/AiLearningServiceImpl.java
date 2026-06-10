package com.ailms.ai.service;

import com.ailms.ai.dto.AiChatRequest;
import com.ailms.ai.dto.AiChatResponse;
import com.ailms.ai.dto.AiQuizGenerationRequest;
import com.ailms.ai.dto.AiStudyPlanRequest;
import com.ailms.ai.dto.AiStudyPlanResponse;
import com.ailms.ai.entity.AiChatMessage;
import com.ailms.ai.entity.AiUsageLog;
import com.ailms.ai.entity.StudyPlan;
import com.ailms.ai.repository.AiChatMessageRepository;
import com.ailms.ai.repository.AiUsageLogRepository;
import com.ailms.ai.repository.StudyPlanRepository;
import com.ailms.common.enums.RoleName;
import com.ailms.common.exception.BadRequestException;
import com.ailms.common.exception.ResourceNotFoundException;
import com.ailms.course.entity.Course;
import com.ailms.course.repository.CourseRepository;
import com.ailms.user.entity.User;
import com.ailms.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AiLearningServiceImpl implements AiLearningService {

    private final OpenAiGateway openAiGateway;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final StudyPlanRepository studyPlanRepository;
    private final AiChatMessageRepository aiChatMessageRepository;
    private final AiUsageLogRepository aiUsageLogRepository;

    @Override
    @Transactional
    public AiStudyPlanResponse generateStudyPlan(AiStudyPlanRequest request, String studentEmail) {
        User student = findUserByEmail(studentEmail);
        ensureRole(student, RoleName.STUDENT);

        String systemPrompt = "You are an academic planner. Generate concise, practical daily plan with revisions and weak-topic strategy.";
        String userPrompt = "Create a study plan for goal: " + request.goal()
                + ". Daily free time (minutes): " + request.dailyFreeTimeMinutes()
                + ". Exam date: " + request.examDate()
                + ". Return a clean markdown plan with week-wise breakup.";
        String generatedPlan = openAiGateway.complete(systemPrompt, userPrompt);

        StudyPlan saved = studyPlanRepository.save(StudyPlan.builder()
                .student(student)
                .goal(request.goal())
                .dailyFreeTimeMinutes(request.dailyFreeTimeMinutes())
                .examDate(request.examDate())
                .planContent(generatedPlan)
                .build());
        saveUsage(student, "AI_STUDY_PLANNER", userPrompt, generatedPlan);

        return new AiStudyPlanResponse(
                saved.getId(),
                saved.getGoal(),
                saved.getDailyFreeTimeMinutes(),
                saved.getExamDate(),
                saved.getPlanContent()
        );
    }

    @Override
    @Transactional
    public String generateQuizQuestions(AiQuizGenerationRequest request, String instructorEmail) {
        User instructor = findUserByEmail(instructorEmail);
        ensureRole(instructor, RoleName.INSTRUCTOR);

        Course course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        if (!course.getInstructor().getId().equals(instructor.getId())) {
            throw new BadRequestException("You can generate quiz only for your own course");
        }

        String systemPrompt = "You are an LMS quiz generator. Return strict JSON array of MCQs.";
        String userPrompt = "Generate " + request.questionCount() + " " + request.difficulty().name()
                + " MCQ questions for course titled '" + course.getTitle()
                + "' and description '" + course.getDescription()
                + "'. Each question must contain questionText, optionA, optionB, optionC, optionD, correctOption.";
        String generated = openAiGateway.complete(systemPrompt, userPrompt);
        saveUsage(instructor, "AI_QUIZ_GENERATOR", userPrompt, generated);
        return generated;
    }

    @Override
    @Transactional
    public AiChatResponse chat(AiChatRequest request, String userEmail) {
        User user = findUserByEmail(userEmail);
        String systemPrompt = "You are an LMS learning assistant. Answer clearly and actionably in short paragraphs.";
        String userPrompt = request.message();
        String reply = openAiGateway.complete(systemPrompt, userPrompt);

        aiChatMessageRepository.save(AiChatMessage.builder()
                .user(user)
                .role("user")
                .content(request.message())
                .build());
        aiChatMessageRepository.save(AiChatMessage.builder()
                .user(user)
                .role("assistant")
                .content(reply)
                .build());
        saveUsage(user, "AI_CHAT_ASSISTANT", userPrompt, reply);

        return new AiChatResponse(reply);
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void ensureRole(User user, RoleName role) {
        if (user.getRole().getName() != role) {
            throw new BadRequestException("Operation requires role: " + role.name());
        }
    }

    private void saveUsage(User user, String featureName, String prompt, String completion) {
        int promptTokens = Math.max(1, prompt.length() / 4);
        int completionTokens = Math.max(1, completion.length() / 4);
        aiUsageLogRepository.save(AiUsageLog.builder()
                .user(user)
                .featureName(featureName)
                .promptTokens(promptTokens)
                .completionTokens(completionTokens)
                .totalTokens(promptTokens + completionTokens)
                .build());
    }
}
