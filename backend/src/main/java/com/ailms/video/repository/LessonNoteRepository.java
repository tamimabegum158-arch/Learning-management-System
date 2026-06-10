package com.ailms.video.repository;

import com.ailms.video.entity.LessonNote;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LessonNoteRepository extends JpaRepository<LessonNote, Long> {
    List<LessonNote> findByStudentIdAndLessonIdOrderByTimestampSecondsAsc(Long studentId, Long lessonId);
}
