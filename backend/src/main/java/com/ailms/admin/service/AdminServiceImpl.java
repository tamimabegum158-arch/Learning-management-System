package com.ailms.admin.service;

import com.ailms.admin.dto.AdminCourseResponse;
import com.ailms.admin.dto.AdminDashboardResponse;
import com.ailms.admin.dto.AdminPlatformReportResponse;
import com.ailms.admin.dto.AdminUserResponse;
import com.ailms.common.enums.RoleName;
import com.ailms.common.exception.BadRequestException;
import com.ailms.common.exception.ResourceNotFoundException;
import com.ailms.course.entity.Course;
import com.ailms.course.enums.CourseStatus;
import com.ailms.course.repository.CourseRepository;
import com.ailms.payment.enums.PaymentStatus;
import com.ailms.payment.repository.PaymentRepository;
import com.ailms.user.entity.User;
import com.ailms.user.repository.UserRepository;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final PaymentRepository paymentRepository;

    @Override
    public Page<AdminUserResponse> getStudents(int page, int size) {
        return userRepository.findByRole_Name(RoleName.STUDENT, PageRequest.of(Math.max(0, page), Math.max(1, size)))
                .map(this::toUserResponse);
    }

    @Override
    public Page<AdminUserResponse> getInstructors(int page, int size) {
        return userRepository.findByRole_Name(RoleName.INSTRUCTOR, PageRequest.of(Math.max(0, page), Math.max(1, size)))
                .map(this::toUserResponse);
    }

    @Override
    @Transactional
    public AdminUserResponse toggleUserLock(Long userId, boolean lock) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getRole().getName() == RoleName.ADMIN) {
            throw new BadRequestException("Admin account cannot be locked");
        }
        user.setAccountNonLocked(!lock);
        return toUserResponse(userRepository.save(user));
    }

    @Override
    public Page<AdminCourseResponse> getCoursesByStatus(String status, int page, int size) {
        CourseStatus courseStatus = CourseStatus.valueOf(status.toUpperCase());
        return courseRepository.findByStatus(courseStatus, PageRequest.of(Math.max(0, page), Math.max(1, size)))
                .map(this::toCourseResponse);
    }

    @Override
    @Transactional
    public AdminCourseResponse approveCourse(Long courseId) {
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        course.setStatus(CourseStatus.PUBLISHED);
        course.setActive(true);
        return toCourseResponse(courseRepository.save(course));
    }

    @Override
    @Transactional
    public AdminCourseResponse rejectCourse(Long courseId) {
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        course.setStatus(CourseStatus.REJECTED);
        return toCourseResponse(courseRepository.save(course));
    }

    @Override
    public AdminDashboardResponse dashboard() {
        long totalUsers = userRepository.count();
        long totalStudents = userRepository.countByRole_Name(RoleName.STUDENT);
        long totalInstructors = userRepository.countByRole_Name(RoleName.INSTRUCTOR);
        long totalCourses = courseRepository.count();
        long pendingApprovals = courseRepository.countByStatus(CourseStatus.PENDING_APPROVAL);
        long successfulPayments = paymentRepository.countByStatus(PaymentStatus.SUCCESS);
        BigDecimal revenue = paymentRepository.totalSuccessfulRevenue();
        return new AdminDashboardResponse(
                totalUsers,
                totalStudents,
                totalInstructors,
                totalCourses,
                pendingApprovals,
                successfulPayments,
                revenue == null ? BigDecimal.ZERO : revenue
        );
    }

    @Override
    public AdminPlatformReportResponse platformReport() {
        return new AdminPlatformReportResponse(
                dashboard(),
                courseRepository.findTop10ByOrderByCreatedAtDesc().stream().map(this::toCourseResponse).toList()
        );
    }

    private AdminUserResponse toUserResponse(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().getName().name(),
                user.isEnabled(),
                user.isAccountNonLocked()
        );
    }

    private AdminCourseResponse toCourseResponse(Course course) {
        return new AdminCourseResponse(
                course.getId(),
                course.getTitle(),
                course.getStatus().name(),
                course.isActive(),
                course.getPrice(),
                course.getInstructor().getId(),
                course.getInstructor().getFullName(),
                course.getCreatedAt()
        );
    }
}
