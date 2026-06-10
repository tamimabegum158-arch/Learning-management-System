package com.ailms.course.controller;

import com.ailms.common.dto.ApiResponse;
import com.ailms.course.dto.CourseReviewResponse;
import com.ailms.course.dto.CreateCourseReviewRequest;
import com.ailms.course.service.CourseCatalogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/student/courses")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class StudentCourseReviewController {

    private final CourseCatalogService courseCatalogService;

    @PostMapping("/{courseId}/reviews")
    public ResponseEntity<ApiResponse<CourseReviewResponse>> upsertReview(
            @PathVariable Long courseId,
            @Valid @RequestBody CreateCourseReviewRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Review saved successfully",
                courseCatalogService.upsertReview(courseId, request, authentication.getName())
        ));
    }
}
