package com.ailms.enrollment.controller;

import com.ailms.common.dto.ApiResponse;
import com.ailms.enrollment.dto.EnrollmentResponse;
import com.ailms.enrollment.service.EnrollmentService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/student/enrollments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping("/{courseId}")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> enroll(
            @PathVariable Long courseId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Enrolled successfully",
                enrollmentService.enrollInCourse(courseId, authentication.getName())
        ));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<Page<EnrollmentResponse>>> getMyEnrollments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Enrollments fetched successfully",
                enrollmentService.getMyEnrollments(authentication.getName(), page, size)
        ));
    }

    @PatchMapping("/{courseId}/progress")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> updateProgress(
            @PathVariable Long courseId,
            @RequestParam @Min(0) @Max(100) Double progress,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Progress updated successfully",
                enrollmentService.updateProgress(courseId, progress, authentication.getName())
        ));
    }
}
