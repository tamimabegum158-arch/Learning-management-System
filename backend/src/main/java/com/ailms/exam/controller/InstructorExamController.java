package com.ailms.exam.controller;

import com.ailms.common.dto.ApiResponse;
import com.ailms.exam.dto.CreateQuestionRequest;
import com.ailms.exam.dto.CreateQuizRequest;
import com.ailms.exam.dto.QuestionResponse;
import com.ailms.exam.dto.QuizResponse;
import com.ailms.exam.service.ExamService;
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
@RequestMapping("/v1/instructor/exams")
@RequiredArgsConstructor
@PreAuthorize("hasRole('INSTRUCTOR')")
public class InstructorExamController {

    private final ExamService examService;

    @PostMapping("/quizzes")
    public ResponseEntity<ApiResponse<QuizResponse>> createQuiz(
            @Valid @RequestBody CreateQuizRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Quiz created successfully",
                examService.createQuiz(request, authentication.getName())
        ));
    }

    @PostMapping("/questions")
    public ResponseEntity<ApiResponse<QuestionResponse>> addQuestion(
            @Valid @RequestBody CreateQuestionRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Question added successfully",
                examService.addQuestion(request, authentication.getName())
        ));
    }
}
