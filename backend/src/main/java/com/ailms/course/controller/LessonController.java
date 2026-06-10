package com.ailms.course.controller;

import com.ailms.common.dto.ApiResponse;
import com.ailms.course.dto.LessonRequest;
import com.ailms.course.dto.LessonResponse;
import com.ailms.course.dto.ModuleRequest;
import com.ailms.course.dto.ModuleResponse;
import com.ailms.course.service.LessonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/v1/lessons", "/api/v1/lessons"})
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;

    @PostMapping("/modules")
    public ResponseEntity<ApiResponse<ModuleResponse>> createModule(
            @Valid @RequestBody ModuleRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Module created successfully",
                lessonService.createModule(request, authentication.getName())
        ));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LessonResponse>> createLesson(
            @Valid @RequestBody LessonRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Lesson created successfully",
                lessonService.createLesson(request, authentication.getName())
        ));
    }

    @PutMapping("/{lessonId}")
    public ResponseEntity<ApiResponse<LessonResponse>> updateLesson(
            @PathVariable Long lessonId,
            @Valid @RequestBody LessonRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Lesson updated successfully",
                lessonService.updateLesson(lessonId, request, authentication.getName())
        ));
    }

    @DeleteMapping("/{lessonId}")
    public ResponseEntity<ApiResponse<Void>> deleteLesson(
            @PathVariable Long lessonId,
            Authentication authentication
    ) {
        lessonService.deleteLesson(lessonId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Lesson deleted successfully", null));
    }

    @DeleteMapping("/modules/{moduleId}")
    public ResponseEntity<ApiResponse<Void>> deleteModule(
            @PathVariable Long moduleId,
            Authentication authentication
    ) {
        lessonService.deleteModule(moduleId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Module deleted successfully", null));
    }

    @GetMapping("/course/{courseId}/modules")
    public ResponseEntity<ApiResponse<List<ModuleResponse>>> getCourseModules(
            @PathVariable Long courseId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Course modules fetched successfully",
                lessonService.getCourseModules(courseId)
        ));
    }

    @GetMapping("/modules/{moduleId}")
    public ResponseEntity<ApiResponse<ModuleResponse>> getModuleById(
            @PathVariable Long moduleId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Module details fetched successfully",
                lessonService.getModuleById(moduleId)
        ));
    }

    @GetMapping("/{lessonId}")
    public ResponseEntity<ApiResponse<LessonResponse>> getLessonById(
            @PathVariable Long lessonId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Lesson details fetched successfully",
                lessonService.getLessonById(lessonId)
        ));
    }

    @GetMapping("/modules/{moduleId}/lessons")
    public ResponseEntity<ApiResponse<List<LessonResponse>>> getModuleLessons(
            @PathVariable Long moduleId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Module lessons fetched successfully",
                lessonService.getModuleLessons(moduleId)
        ));
    }
}
