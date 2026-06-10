package com.ailms.video.service;

import com.ailms.video.dto.CreateLessonNoteRequest;
import com.ailms.video.dto.LessonNoteResponse;
import com.ailms.video.dto.LessonProgressResponse;
import com.ailms.video.dto.ResumeLessonResponse;
import com.ailms.video.dto.UpdateLessonProgressRequest;
import java.util.List;

public interface VideoLearningService {
    LessonProgressResponse updateLessonProgress(Long lessonId, UpdateLessonProgressRequest request, String studentEmail);
    ResumeLessonResponse getResumeLesson(Long courseId, String studentEmail);
    LessonNoteResponse createLessonNote(Long lessonId, CreateLessonNoteRequest request, String studentEmail);
    List<LessonNoteResponse> getLessonNotes(Long lessonId, String studentEmail);
}
