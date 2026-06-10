package com.ailms.video.controller;

import com.ailms.common.dto.ApiResponse;
import com.ailms.video.dto.CreateLessonNoteRequest;
import com.ailms.video.dto.LessonNoteResponse;
import com.ailms.video.dto.LessonProgressResponse;
import com.ailms.video.dto.ResumeLessonResponse;
import com.ailms.video.dto.UpdateLessonProgressRequest;
import com.ailms.video.service.VideoLearningService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/student/video")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class VideoLearningController {

    private final VideoLearningService videoLearningService;

    @PatchMapping("/lessons/{lessonId}/progress")
    public ResponseEntity<ApiResponse<LessonProgressResponse>> updateProgress(
            @PathVariable Long lessonId,
            @Valid @RequestBody UpdateLessonProgressRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Lesson progress updated successfully",
                videoLearningService.updateLessonProgress(lessonId, request, authentication.getName())
        ));
    }

    @GetMapping("/courses/{courseId}/resume")
    public ResponseEntity<ApiResponse<ResumeLessonResponse>> getResumeLesson(
            @PathVariable Long courseId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Resume lesson fetched successfully",
                videoLearningService.getResumeLesson(courseId, authentication.getName())
        ));
    }

    @PostMapping("/lessons/{lessonId}/notes")
    public ResponseEntity<ApiResponse<LessonNoteResponse>> createNote(
            @PathVariable Long lessonId,
            @Valid @RequestBody CreateLessonNoteRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Lesson note added successfully",
                videoLearningService.createLessonNote(lessonId, request, authentication.getName())
        ));
    }

    @GetMapping("/lessons/{lessonId}/notes")
    public ResponseEntity<ApiResponse<List<LessonNoteResponse>>> getNotes(
            @PathVariable Long lessonId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Lesson notes fetched successfully",
                videoLearningService.getLessonNotes(lessonId, authentication.getName())
        ));
    }
}
