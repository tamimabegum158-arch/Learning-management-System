package com.ailms.course.service;

import com.ailms.common.enums.RoleName;
import com.ailms.common.exception.BadRequestException;
import com.ailms.common.exception.ResourceNotFoundException;
import com.ailms.course.dto.LessonRequest;
import com.ailms.course.dto.LessonResponse;
import com.ailms.course.dto.ModuleRequest;
import com.ailms.course.dto.ModuleResponse;
import com.ailms.course.entity.Course;
import com.ailms.course.entity.CourseModule;
import com.ailms.course.entity.Lesson;
import com.ailms.course.repository.CourseModuleRepository;
import com.ailms.course.repository.CourseRepository;
import com.ailms.course.repository.LessonRepository;
import com.ailms.user.entity.User;
import com.ailms.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LessonServiceImpl implements LessonService {

    private final LessonRepository lessonRepository;
    private final CourseModuleRepository moduleRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ModuleResponse createModule(ModuleRequest request, String instructorEmail) {
        User instructor = findUserByEmail(instructorEmail);
        Course course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        if (!course.getInstructor().getId().equals(instructor.getId())) {
            throw new BadRequestException("You can only add modules to your own course");
        }

        CourseModule module = CourseModule.builder()
                .course(course)
                .title(request.title())
                .moduleOrder(request.moduleOrder())
                .build();

        return toModuleResponse(moduleRepository.save(module), List.of());
    }

    @Override
    @Transactional
    public LessonResponse createLesson(LessonRequest request, String instructorEmail) {
        User instructor = findUserByEmail(instructorEmail);
        CourseModule module = moduleRepository.findById(request.moduleId())
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));

        if (!module.getCourse().getInstructor().getId().equals(instructor.getId())) {
            throw new BadRequestException("You can only add lessons to your own course");
        }

        Lesson lesson = Lesson.builder()
                .module(module)
                .title(request.title())
                .videoUrl(request.videoUrl())
                .resourceUrl(request.resourceUrl())
                .lessonOrder(request.lessonOrder())
                .durationMinutes(request.durationMinutes() != null ? request.durationMinutes() : 0)
                .build();

        return toLessonResponse(lessonRepository.save(lesson));
    }

    @Override
    @Transactional
    public LessonResponse updateLesson(Long lessonId, LessonRequest request, String instructorEmail) {
        User instructor = findUserByEmail(instructorEmail);
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));

        if (!lesson.getModule().getCourse().getInstructor().getId().equals(instructor.getId())) {
            throw new BadRequestException("You can only update lessons in your own course");
        }

        lesson.setTitle(request.title());
        lesson.setVideoUrl(request.videoUrl());
        lesson.setResourceUrl(request.resourceUrl());
        lesson.setLessonOrder(request.lessonOrder());
        if (request.durationMinutes() != null) {
            lesson.setDurationMinutes(request.durationMinutes());
        }

        return toLessonResponse(lessonRepository.save(lesson));
    }

    @Override
    @Transactional
    public void deleteLesson(Long lessonId, String instructorEmail) {
        User instructor = findUserByEmail(instructorEmail);
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));

        if (!lesson.getModule().getCourse().getInstructor().getId().equals(instructor.getId())) {
            throw new BadRequestException("You can only delete lessons from your own course");
        }

        lessonRepository.delete(lesson);
    }

    @Override
    @Transactional
    public void deleteModule(Long moduleId, String instructorEmail) {
        User instructor = findUserByEmail(instructorEmail);
        CourseModule module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));

        if (!module.getCourse().getInstructor().getId().equals(instructor.getId())) {
            throw new BadRequestException("You can only delete modules from your own course");
        }

        moduleRepository.delete(module);
    }

    @Override
    public List<ModuleResponse> getCourseModules(Long courseId) {
        List<CourseModule> modules = moduleRepository.findByCourseIdOrderByModuleOrderAsc(courseId);
        return modules.stream()
                .map(module -> {
                    List<Lesson> lessons = lessonRepository.findByModuleIdOrderByLessonOrderAsc(module.getId());
                    return toModuleResponse(module, lessons);
                })
                .toList();
    }

    @Override
    public ModuleResponse getModuleById(Long moduleId) {
        CourseModule module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));
        List<Lesson> lessons = lessonRepository.findByModuleIdOrderByLessonOrderAsc(moduleId);
        return toModuleResponse(module, lessons);
    }

    @Override
    public LessonResponse getLessonById(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));
        return toLessonResponse(lesson);
    }

    @Override
    public List<LessonResponse> getModuleLessons(Long moduleId) {
        List<Lesson> lessons = lessonRepository.findByModuleIdOrderByLessonOrderAsc(moduleId);
        return lessons.stream()
                .map(this::toLessonResponse)
                .toList();
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private LessonResponse toLessonResponse(Lesson lesson) {
        return new LessonResponse(
                lesson.getId(),
                lesson.getModule().getId(),
                lesson.getModule().getCourse().getId(),
                lesson.getTitle(),
                lesson.getVideoUrl(),
                lesson.getResourceUrl(),
                lesson.getLessonOrder(),
                lesson.getDurationMinutes(),
                LocalDateTime.now()
        );
    }

    private ModuleResponse toModuleResponse(CourseModule module, List<Lesson> lessons) {
        List<LessonResponse> lessonResponses = lessons.stream()
                .map(this::toLessonResponse)
                .toList();

        int totalDuration = lessons.stream()
                .mapToInt(Lesson::getDurationMinutes)
                .sum();

        return new ModuleResponse(
                module.getId(),
                module.getCourse().getId(),
                module.getTitle(),
                module.getModuleOrder(),
                lessonResponses,
                lessonResponses.size(),
                totalDuration
        );
    }
}
