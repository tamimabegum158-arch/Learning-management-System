package com.ailms.video.service;

import com.ailms.common.enums.RoleName;
import com.ailms.common.exception.BadRequestException;
import com.ailms.common.exception.ResourceNotFoundException;
import com.ailms.course.entity.Course;
import com.ailms.course.entity.CourseModule;
import com.ailms.course.entity.Lesson;
import com.ailms.course.repository.CourseModuleRepository;
import com.ailms.course.repository.CourseRepository;
import com.ailms.course.repository.LessonRepository;
import com.ailms.enrollment.repository.EnrollmentRepository;
import com.ailms.user.entity.User;
import com.ailms.user.repository.UserRepository;
import com.ailms.video.dto.CreateLessonNoteRequest;
import com.ailms.video.dto.LessonNoteResponse;
import com.ailms.video.dto.LessonProgressResponse;
import com.ailms.video.dto.ResumeLessonResponse;
import com.ailms.video.dto.UpdateLessonProgressRequest;
import com.ailms.video.entity.LessonNote;
import com.ailms.video.entity.LessonProgress;
import com.ailms.video.repository.LessonNoteRepository;
import com.ailms.video.repository.LessonProgressRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VideoLearningServiceImpl implements VideoLearningService {

    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;
    private final CourseModuleRepository courseModuleRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final LessonNoteRepository lessonNoteRepository;

    @Override
    @Transactional
    public LessonProgressResponse updateLessonProgress(Long lessonId, UpdateLessonProgressRequest request, String studentEmail) {
        User student = findStudent(studentEmail);
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));

        assertStudentEnrolled(student.getId(), lesson.getModule().getCourse().getId());

        LessonProgress progress = lessonProgressRepository.findByStudentIdAndLessonId(student.getId(), lessonId)
                .orElseGet(() -> LessonProgress.builder().student(student).lesson(lesson).build());

        progress.setWatchedSeconds(request.watchedSeconds());
        progress.setCompletionPercentage(request.completionPercentage());
        progress.setCompleted(request.completionPercentage() >= 95.0);
        progress.setUpdatedAt(LocalDateTime.now());
        LessonProgress saved = lessonProgressRepository.save(progress);

        return toProgressResponse(saved);
    }

    @Override
    public ResumeLessonResponse getResumeLesson(Long courseId, String studentEmail) {
        User student = findStudent(studentEmail);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        assertStudentEnrolled(student.getId(), course.getId());

        List<Lesson> orderedLessons = loadOrderedLessons(course.getId());
        if (orderedLessons.isEmpty()) {
            throw new ResourceNotFoundException("No lessons found for this course");
        }

        ResumeLessonResponse fallback = new ResumeLessonResponse(
                orderedLessons.get(0).getId(),
                orderedLessons.get(0).getTitle(),
                0,
                0.0
        );

        for (Lesson lesson : orderedLessons) {
            LessonProgress progress = lessonProgressRepository.findByStudentIdAndLessonId(student.getId(), lesson.getId()).orElse(null);
            if (progress == null || !progress.isCompleted()) {
                int resumeSeconds = progress == null ? 0 : progress.getWatchedSeconds();
                double completion = progress == null ? 0.0 : progress.getCompletionPercentage();
                return new ResumeLessonResponse(lesson.getId(), lesson.getTitle(), resumeSeconds, completion);
            }
        }
        return fallback;
    }

    @Override
    @Transactional
    public LessonNoteResponse createLessonNote(Long lessonId, CreateLessonNoteRequest request, String studentEmail) {
        User student = findStudent(studentEmail);
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));
        assertStudentEnrolled(student.getId(), lesson.getModule().getCourse().getId());

        LessonNote note = LessonNote.builder()
                .student(student)
                .lesson(lesson)
                .timestampSeconds(request.timestampSeconds())
                .noteText(request.noteText())
                .build();
        return toNoteResponse(lessonNoteRepository.save(note));
    }

    @Override
    public List<LessonNoteResponse> getLessonNotes(Long lessonId, String studentEmail) {
        User student = findStudent(studentEmail);
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));
        assertStudentEnrolled(student.getId(), lesson.getModule().getCourse().getId());

        return lessonNoteRepository.findByStudentIdAndLessonIdOrderByTimestampSecondsAsc(student.getId(), lessonId)
                .stream()
                .map(this::toNoteResponse)
                .toList();
    }

    private User findStudent(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getRole().getName() != RoleName.STUDENT) {
            throw new BadRequestException("Operation requires role: STUDENT");
        }
        return user;
    }

    private void assertStudentEnrolled(Long studentId, Long courseId) {
        if (!enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new BadRequestException("Student is not enrolled in this course");
        }
    }

    private List<Lesson> loadOrderedLessons(Long courseId) {
        List<CourseModule> modules = courseModuleRepository.findByCourseIdOrderByModuleOrderAsc(courseId);
        List<Lesson> allLessons = new ArrayList<>();
        for (CourseModule module : modules) {
            allLessons.addAll(lessonRepository.findByModuleIdOrderByLessonOrderAsc(module.getId()));
        }
        return allLessons;
    }

    private LessonProgressResponse toProgressResponse(LessonProgress progress) {
        return new LessonProgressResponse(
                progress.getLesson().getId(),
                progress.getLesson().getTitle(),
                progress.getWatchedSeconds(),
                progress.getCompletionPercentage(),
                progress.isCompleted(),
                progress.getUpdatedAt()
        );
    }

    private LessonNoteResponse toNoteResponse(LessonNote note) {
        return new LessonNoteResponse(
                note.getId(),
                note.getLesson().getId(),
                note.getTimestampSeconds(),
                note.getNoteText(),
                note.getCreatedAt()
        );
    }
}
