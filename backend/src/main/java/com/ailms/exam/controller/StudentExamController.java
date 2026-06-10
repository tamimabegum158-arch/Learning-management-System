package com.ailms.exam.controller;

import com.ailms.common.dto.ApiResponse;
import com.ailms.exam.dto.ExamResultResponse;
import com.ailms.exam.dto.LeaderboardEntryResponse;
import com.ailms.exam.dto.StartAttemptResponse;
import com.ailms.exam.dto.SubmitExamRequest;
import com.ailms.exam.service.ExamService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/student/exams")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class StudentExamController {

    private final ExamService examService;

    @PostMapping("/quizzes/{quizId}/start")
    public ResponseEntity<ApiResponse<StartAttemptResponse>> startAttempt(
            @PathVariable Long quizId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Exam started successfully",
                examService.startAttempt(quizId, authentication.getName())
        ));
    }

    @PostMapping("/attempts/{attemptId}/submit")
    public ResponseEntity<ApiResponse<ExamResultResponse>> submitAttempt(
            @PathVariable Long attemptId,
            @Valid @RequestBody SubmitExamRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Exam submitted successfully",
                examService.submitAttempt(attemptId, request, authentication.getName())
        ));
    }

    @GetMapping("/quizzes/{quizId}/leaderboard")
    public ResponseEntity<ApiResponse<List<LeaderboardEntryResponse>>> leaderboard(@PathVariable Long quizId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Leaderboard fetched successfully",
                examService.getLeaderboard(quizId)
        ));
    }
}
