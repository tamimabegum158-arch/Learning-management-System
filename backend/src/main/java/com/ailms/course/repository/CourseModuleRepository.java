package com.ailms.course.repository;

import com.ailms.course.entity.CourseModule;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseModuleRepository extends JpaRepository<CourseModule, Long> {
    List<CourseModule> findByCourseIdOrderByModuleOrderAsc(Long courseId);
}
