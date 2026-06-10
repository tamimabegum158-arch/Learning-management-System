package com.ailms.course.service;

import com.ailms.common.enums.RoleName;
import com.ailms.common.exception.BadRequestException;
import com.ailms.common.exception.ResourceNotFoundException;
import com.ailms.common.util.PageRequestUtil;
import com.ailms.course.dto.CourseResponse;
import com.ailms.course.dto.CreateCourseRequest;
import com.ailms.course.dto.UpdateCourseRequest;
import com.ailms.course.entity.Course;
import com.ailms.course.enums.CourseStatus;
import com.ailms.course.repository.CourseRepository;
import com.ailms.user.entity.User;
import com.ailms.user.repository.UserRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CourseResponse createCourse(CreateCourseRequest request, String instructorEmail) {
        User instructor = findUserByEmail(instructorEmail);
        validateRole(instructor, RoleName.INSTRUCTOR);

        Course course = Course.builder()
                .title(request.title())
                .description(request.description())
                .price(request.price())
                .level(request.level())
                .status(CourseStatus.DRAFT)
                .instructor(instructor)
                .build();
        return toResponse(courseRepository.save(course));
    }

    @Override
    @Transactional
    public CourseResponse updateCourse(Long courseId, UpdateCourseRequest request, String instructorEmail) {
        User instructor = findUserByEmail(instructorEmail);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        if (!course.getInstructor().getId().equals(instructor.getId())) {
            throw new BadRequestException("You can update only your own course");
        }

        course.setTitle(request.title());
        course.setDescription(request.description());
        course.setPrice(request.price());
        course.setLevel(request.level());
        course.setStatus(request.status());
        course.setUpdatedAt(LocalDateTime.now());
        return toResponse(courseRepository.save(course));
    }

    @Override
    public CourseResponse getPublishedCourseById(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        if (course.getStatus() != CourseStatus.PUBLISHED || !course.isActive()) {
            throw new ResourceNotFoundException("Published course not found");
        }
        return toResponse(course);
    }

    @Override
    public Page<CourseResponse> getPublishedCourses(String q, int page, int size, String sortBy, String direction) {
        Pageable pageable = PageRequestUtil.of(page, size, sortBy, direction);
        Page<Course> courses = (q == null || q.isBlank())
                ? courseRepository.findByStatusAndActiveTrue(CourseStatus.PUBLISHED, pageable)
                : courseRepository.findByStatusAndActiveTrueAndTitleContainingIgnoreCase(CourseStatus.PUBLISHED, q.trim(), pageable);
        return courses.map(this::toResponse);
    }

    @Override
    public Page<CourseResponse> getInstructorCourses(String instructorEmail, int page, int size, String sortBy, String direction) {
        User instructor = findUserByEmail(instructorEmail);
        validateRole(instructor, RoleName.INSTRUCTOR);
        Pageable pageable = PageRequestUtil.of(page, size, sortBy, direction);
        return courseRepository.findByInstructorId(instructor.getId(), pageable).map(this::toResponse);
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void validateRole(User user, RoleName roleName) {
        if (user.getRole().getName() != roleName) {
            throw new BadRequestException("Operation requires role: " + roleName.name());
        }
    }

    private CourseResponse toResponse(Course course) {
        return new CourseResponse(
                course.getId(),
                course.getTitle(),
                course.getDescription(),
                course.getPrice(),
                course.getLevel(),
                course.getStatus(),
                course.getInstructor().getId(),
                course.getInstructor().getFullName(),
                course.isActive(),
                course.getCreatedAt(),
                0,  // totalEnrollments
                null,  // averageRating
                0L  // reviewCount
        );
    }
}
