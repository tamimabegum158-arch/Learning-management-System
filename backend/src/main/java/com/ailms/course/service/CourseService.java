package com.ailms.course.service;

import com.ailms.course.dto.CourseResponse;
import com.ailms.course.dto.CreateCourseRequest;
import com.ailms.course.dto.UpdateCourseRequest;
import org.springframework.data.domain.Page;

public interface CourseService {
    CourseResponse createCourse(CreateCourseRequest request, String instructorEmail);
    CourseResponse updateCourse(Long courseId, UpdateCourseRequest request, String instructorEmail);
    CourseResponse getPublishedCourseById(Long courseId);
    Page<CourseResponse> getPublishedCourses(String q, int page, int size, String sortBy, String direction);
    Page<CourseResponse> getInstructorCourses(String instructorEmail, int page, int size, String sortBy, String direction);
}
