package com.ailms.admin.dto;

import java.math.BigDecimal;

public record AdminDashboardResponse(
        long totalUsers,
        long totalStudents,
        long totalInstructors,
        long totalCourses,
        long pendingCourseApprovals,
        long totalSuccessfulPayments,
        BigDecimal totalRevenue
) {
}
