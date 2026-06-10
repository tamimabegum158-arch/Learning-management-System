package com.ailms.admin.controller;

import com.ailms.admin.dto.AdminCourseResponse;
import com.ailms.admin.dto.AdminDashboardResponse;
import com.ailms.admin.dto.AdminPlatformReportResponse;
import com.ailms.admin.dto.AdminUserResponse;
import com.ailms.admin.service.AdminService;
import com.ailms.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users/students")
    public ResponseEntity<ApiResponse<Page<AdminUserResponse>>> students(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Students fetched successfully",
                adminService.getStudents(page, size)
        ));
    }

    @GetMapping("/users/instructors")
    public ResponseEntity<ApiResponse<Page<AdminUserResponse>>> instructors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Instructors fetched successfully",
                adminService.getInstructors(page, size)
        ));
    }

    @PatchMapping("/users/{userId}/lock")
    public ResponseEntity<ApiResponse<AdminUserResponse>> lock(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(
                "User locked successfully",
                adminService.toggleUserLock(userId, true)
        ));
    }

    @PatchMapping("/users/{userId}/unlock")
    public ResponseEntity<ApiResponse<AdminUserResponse>> unlock(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(
                "User unlocked successfully",
                adminService.toggleUserLock(userId, false)
        ));
    }

    @GetMapping("/courses")
    public ResponseEntity<ApiResponse<Page<AdminCourseResponse>>> courses(
            @RequestParam(defaultValue = "PENDING_APPROVAL") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Courses fetched successfully",
                adminService.getCoursesByStatus(status, page, size)
        ));
    }

    @PatchMapping("/courses/{courseId}/approve")
    public ResponseEntity<ApiResponse<AdminCourseResponse>> approveCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Course approved successfully",
                adminService.approveCourse(courseId)
        ));
    }

    @PatchMapping("/courses/{courseId}/reject")
    public ResponseEntity<ApiResponse<AdminCourseResponse>> rejectCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Course rejected successfully",
                adminService.rejectCourse(courseId)
        ));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> dashboard() {
        return ResponseEntity.ok(ApiResponse.success(
                "Admin dashboard fetched successfully",
                adminService.dashboard()
        ));
    }

    @GetMapping("/reports/platform")
    public ResponseEntity<ApiResponse<AdminPlatformReportResponse>> platformReport() {
        return ResponseEntity.ok(ApiResponse.success(
                "Platform report fetched successfully",
                adminService.platformReport()
        ));
    }
}
