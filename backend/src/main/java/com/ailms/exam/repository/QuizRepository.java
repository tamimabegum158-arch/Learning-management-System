package com.ailms.exam.repository;

import com.ailms.exam.entity.Quiz;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByCourseIdAndActiveTrue(Long courseId);
}
