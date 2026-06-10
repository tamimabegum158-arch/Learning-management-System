package com.ailms.exam.repository;

import com.ailms.exam.entity.AttemptAnswer;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttemptAnswerRepository extends JpaRepository<AttemptAnswer, Long> {
    Optional<AttemptAnswer> findByAttemptIdAndQuestionId(Long attemptId, Long questionId);
    List<AttemptAnswer> findByAttemptId(Long attemptId);
}
