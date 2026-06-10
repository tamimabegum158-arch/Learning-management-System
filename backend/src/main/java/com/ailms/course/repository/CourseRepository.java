package com.ailms.course.repository;

import com.ailms.course.entity.Course;
import com.ailms.course.enums.CourseStatus;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface CourseRepository extends JpaRepository<Course, Long>, JpaSpecificationExecutor<Course> {
    Page<Course> findByStatusAndActiveTrue(CourseStatus status, Pageable pageable);
    Page<Course> findByStatusAndActiveTrueAndTitleContainingIgnoreCase(CourseStatus status, String title, Pageable pageable);
    Page<Course> findByInstructorId(Long instructorId, Pageable pageable);
    Page<Course> findByStatus(CourseStatus status, Pageable pageable);
    long countByStatus(CourseStatus status);
    List<Course> findTop10ByOrderByCreatedAtDesc();

    Page<Course> findByStatusAndActiveTrueOrderByIdDesc(CourseStatus status, Pageable pageable);

    Page<Course> findByStatusAndActiveTrueAndIdLessThanOrderByIdDesc(CourseStatus status, Long id, Pageable pageable);
}
