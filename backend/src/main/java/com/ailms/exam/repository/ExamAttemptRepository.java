package com.ailms.exam.repository;

import com.ailms.exam.entity.ExamAttempt;
import com.ailms.exam.enums.ExamAttemptStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {
    Optional<ExamAttempt> findByIdAndStudentId(Long attemptId, Long studentId);
    Optional<ExamAttempt> findByQuizIdAndStudentIdAndStatus(Long quizId, Long studentId, ExamAttemptStatus status);
    List<ExamAttempt> findTop10ByQuizIdAndStatusOrderByScorePercentageDescSubmittedAtAsc(Long quizId, ExamAttemptStatus status);
}
