package com.ailms.admin.service;

import com.ailms.admin.dto.AdminCourseResponse;
import com.ailms.admin.dto.AdminDashboardResponse;
import com.ailms.admin.dto.AdminPlatformReportResponse;
import com.ailms.admin.dto.AdminUserResponse;
import org.springframework.data.domain.Page;

public interface AdminService {
    Page<AdminUserResponse> getStudents(int page, int size);
    Page<AdminUserResponse> getInstructors(int page, int size);
    AdminUserResponse toggleUserLock(Long userId, boolean lock);
    Page<AdminCourseResponse> getCoursesByStatus(String status, int page, int size);
    AdminCourseResponse approveCourse(Long courseId);
    AdminCourseResponse rejectCourse(Long courseId);
    AdminDashboardResponse dashboard();
    AdminPlatformReportResponse platformReport();
}
