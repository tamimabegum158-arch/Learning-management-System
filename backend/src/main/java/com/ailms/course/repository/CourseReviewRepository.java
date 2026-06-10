package com.ailms.course.repository;

import com.ailms.course.dto.CourseRatingAggregate;
import com.ailms.course.entity.CourseReview;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CourseReviewRepository extends JpaRepository<CourseReview, Long> {

    Optional<CourseReview> findByStudentIdAndCourseId(Long studentId, Long courseId);

    Page<CourseReview> findByCourseIdOrderByCreatedAtDesc(Long courseId, Pageable pageable);

    @Query("select new com.ailms.course.dto.CourseRatingAggregate(r.course.id, avg(r.rating), count(r)) "
            + "from CourseReview r where r.course.id in :ids group by r.course.id")
    List<CourseRatingAggregate> aggregateRatingsByCourseIds(@Param("ids") List<Long> ids);
}
