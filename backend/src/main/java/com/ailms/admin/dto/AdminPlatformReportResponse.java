package com.ailms.admin.dto;

import java.util.List;

public record AdminPlatformReportResponse(
        AdminDashboardResponse dashboard,
        List<AdminCourseResponse> latestCourses
) {
}
