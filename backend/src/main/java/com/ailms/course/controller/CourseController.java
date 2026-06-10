package com.ailms.course.controller;

import com.ailms.common.dto.ApiResponse;
import com.ailms.course.dto.CourseResponse;
import com.ailms.course.dto.CourseReviewResponse;
import com.ailms.course.dto.PublishedCourseItem;
import com.ailms.course.enums.CourseLevel;
import com.ailms.course.service.CourseCatalogService;
import com.ailms.course.service.CourseService;
import com.ailms.security.SecurityUtil;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/v1/courses", "/api/v1/courses"})
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final CourseCatalogService courseCatalogService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CourseResponse>>> getPublishedCourses(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Published courses fetched successfully",
                courseService.getPublishedCourses(q, page, size, sortBy, direction)
        ));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<PublishedCourseItem>>> searchPublishedCourses(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "level", required = false) CourseLevel level,
            @RequestParam(value = "minPrice", required = false) BigDecimal minPrice,
            @RequestParam(value = "maxPrice", required = false) BigDecimal maxPrice,
            @RequestParam(value = "minRating", required = false) Double minRating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            Authentication authentication
    ) {
        Long studentId = SecurityUtil.optionalStudentId(authentication);
        return ResponseEntity.ok(ApiResponse.success(
                "Courses search completed successfully",
                courseCatalogService.searchPublishedCourses(
                        q, level, minPrice, maxPrice, minRating, page, size, sortBy, direction, studentId
                )
        ));
    }

    @GetMapping("/feed")
    public ResponseEntity<ApiResponse<List<PublishedCourseItem>>> feedPublishedCourses(
            @RequestParam(value = "cursor", required = false) Long cursor,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        Long studentId = SecurityUtil.optionalStudentId(authentication);
        return ResponseEntity.ok(ApiResponse.success(
                "Course feed loaded successfully",
                courseCatalogService.feedPublishedCourses(cursor, size, studentId)
        ));
    }

    @GetMapping("/{courseId}/reviews")
    public ResponseEntity<ApiResponse<Page<CourseReviewResponse>>> listReviews(
            @PathVariable Long courseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Course reviews fetched successfully",
                courseCatalogService.listCourseReviews(courseId, page, size)
        ));
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<ApiResponse<CourseResponse>> getCourseById(@PathVariable Long courseId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Course details fetched successfully",
                courseService.getPublishedCourseById(courseId)
        ));
    }
}
