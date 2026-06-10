package com.ailms.course.service;

import com.ailms.course.dto.LessonRequest;
import com.ailms.course.dto.LessonResponse;
import com.ailms.course.dto.ModuleRequest;
import com.ailms.course.dto.ModuleResponse;

import java.util.List;

public interface LessonService {
    ModuleResponse createModule(ModuleRequest request, String instructorEmail);
    LessonResponse createLesson(LessonRequest request, String instructorEmail);
    LessonResponse updateLesson(Long lessonId, LessonRequest request, String instructorEmail);
    void deleteLesson(Long lessonId, String instructorEmail);
    void deleteModule(Long moduleId, String instructorEmail);
    
    List<ModuleResponse> getCourseModules(Long courseId);
    ModuleResponse getModuleById(Long moduleId);
    LessonResponse getLessonById(Long lessonId);
    List<LessonResponse> getModuleLessons(Long moduleId);
}
