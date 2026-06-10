package com.ailms.course.service;

import com.ailms.course.dto.CourseReviewResponse;
import com.ailms.course.dto.CreateCourseReviewRequest;
import com.ailms.course.dto.PublishedCourseItem;
import com.ailms.course.enums.CourseLevel;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.domain.Page;

public interface CourseCatalogService {

    Page<PublishedCourseItem> searchPublishedCourses(
            String q,
            CourseLevel level,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Double minRating,
            int page,
            int size,
            String sortBy,
            String direction,
            Long studentIdOrNull
    );

    List<PublishedCourseItem> feedPublishedCourses(Long cursorId, int size, Long studentIdOrNull);

    Page<CourseReviewResponse> listCourseReviews(Long courseId, int page, int size);

    CourseReviewResponse upsertReview(Long courseId, CreateCourseReviewRequest request, String studentEmail);
}
