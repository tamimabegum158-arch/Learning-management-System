package com.ailms.enrollment.service;

import com.ailms.enrollment.dto.EnrollmentResponse;
import org.springframework.data.domain.Page;

public interface EnrollmentService {
    EnrollmentResponse enrollInCourse(Long courseId, String studentEmail);
    Page<EnrollmentResponse> getMyEnrollments(String studentEmail, int page, int size);
    EnrollmentResponse updateProgress(Long courseId, Double progress, String studentEmail);
}
