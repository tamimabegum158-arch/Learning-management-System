package com.ailms.enrollment.service;

import com.ailms.common.enums.RoleName;
import com.ailms.common.exception.BadRequestException;
import com.ailms.common.exception.ResourceNotFoundException;
import com.ailms.course.entity.Course;
import com.ailms.course.enums.CourseStatus;
import com.ailms.course.repository.CourseRepository;
import com.ailms.enrollment.dto.EnrollmentResponse;
import com.ailms.enrollment.entity.Enrollment;
import com.ailms.enrollment.repository.EnrollmentRepository;
import com.ailms.notification.service.NotificationService;
import com.ailms.user.entity.User;
import com.ailms.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public EnrollmentResponse enrollInCourse(Long courseId, String studentEmail) {
        User student = findStudent(studentEmail);
        Course course = findPublishedCourse(courseId);

        if (enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            throw new BadRequestException("You are already enrolled in this course");
        }

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .progressPercentage(0.0)
                .build();
        Enrollment saved = enrollmentRepository.save(enrollment);
        notificationService.notifyUser(
                student.getId(),
                "Enrollment successful",
                "You have enrolled in course: " + course.getTitle()
        );
        return toResponse(saved);
    }

    @Override
    public Page<EnrollmentResponse> getMyEnrollments(String studentEmail, int page, int size) {
        User student = findStudent(studentEmail);
        return enrollmentRepository.findByStudentId(student.getId(), PageRequest.of(Math.max(page, 0), Math.max(size, 1)))
                .map(this::toResponse);
    }

    @Override
    @Transactional
    public EnrollmentResponse updateProgress(Long courseId, Double progress, String studentEmail) {
        User student = findStudent(studentEmail);
        if (progress == null || progress < 0 || progress > 100) {
            throw new BadRequestException("Progress must be between 0 and 100");
        }

        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(student.getId(), courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));
        enrollment.setProgressPercentage(progress);
        Enrollment saved = enrollmentRepository.save(enrollment);
        if (progress >= 100.0) {
            notificationService.notifyUser(
                    student.getId(),
                    "Course progress complete",
                    "You completed all tracked progress in: " + saved.getCourse().getTitle()
            );
        }
        return toResponse(saved);
    }

    private User findStudent(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getRole().getName() != RoleName.STUDENT) {
            throw new BadRequestException("Operation requires role: STUDENT");
        }
        return user;
    }

    private Course findPublishedCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        if (course.getStatus() != CourseStatus.PUBLISHED || !course.isActive()) {
            throw new BadRequestException("Course is not available for enrollment");
        }
        return course;
    }

    private EnrollmentResponse toResponse(Enrollment enrollment) {
        return new EnrollmentResponse(
                enrollment.getId(),
                enrollment.getStudent().getId(),
                enrollment.getCourse().getId(),
                enrollment.getCourse().getTitle(),
                enrollment.getProgressPercentage(),
                enrollment.getEnrolledAt()
        );
    }
}
