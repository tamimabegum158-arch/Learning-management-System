package com.ailms.wishlist.repository;

import com.ailms.wishlist.entity.WishlistItem;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WishlistRepository extends JpaRepository<WishlistItem, Long> {

    Optional<WishlistItem> findByStudentIdAndCourseId(Long studentId, Long courseId);

    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);

    void deleteByStudentIdAndCourseId(Long studentId, Long courseId);

    Page<WishlistItem> findByStudentIdOrderByCreatedAtDesc(Long studentId, Pageable pageable);

    @Query("select w.course.id from WishlistItem w where w.student.id = :studentId and w.course.id in :courseIds")
    List<Long> findWishlistedCourseIds(@Param("studentId") Long studentId, @Param("courseIds") Collection<Long> courseIds);
}
