package com.ailms.ai.repository;

import com.ailms.ai.entity.StudyPlan;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudyPlanRepository extends JpaRepository<StudyPlan, Long> {
    List<StudyPlan> findByStudentIdOrderByCreatedAtDesc(Long studentId);
}
