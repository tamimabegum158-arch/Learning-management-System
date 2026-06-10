package com.ailms.exam.service;

import com.ailms.exam.dto.CreateQuestionRequest;
import com.ailms.exam.dto.CreateQuizRequest;
import com.ailms.exam.dto.ExamResultResponse;
import com.ailms.exam.dto.LeaderboardEntryResponse;
import com.ailms.exam.dto.QuestionResponse;
import com.ailms.exam.dto.QuizResponse;
import com.ailms.exam.dto.StartAttemptResponse;
import com.ailms.exam.dto.SubmitExamRequest;
import java.util.List;

public interface ExamService {
    QuizResponse createQuiz(CreateQuizRequest request, String instructorEmail);
    QuestionResponse addQuestion(CreateQuestionRequest request, String instructorEmail);
    StartAttemptResponse startAttempt(Long quizId, String studentEmail);
    ExamResultResponse submitAttempt(Long attemptId, SubmitExamRequest request, String studentEmail);
    List<LeaderboardEntryResponse> getLeaderboard(Long quizId);
}
