package com.ailms.wishlist.service;

import com.ailms.common.enums.RoleName;
import com.ailms.common.exception.BadRequestException;
import com.ailms.common.exception.ResourceNotFoundException;
import com.ailms.common.util.CoursePageableUtil;
import com.ailms.course.dto.CourseRatingAggregate;
import com.ailms.course.dto.PublishedCourseItem;
import com.ailms.course.entity.Course;
import com.ailms.course.enums.CourseStatus;
import com.ailms.course.repository.CourseRepository;
import com.ailms.course.repository.CourseReviewRepository;
import com.ailms.user.entity.User;
import com.ailms.user.repository.UserRepository;
import com.ailms.wishlist.entity.WishlistItem;
import com.ailms.wishlist.repository.WishlistRepository;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final CourseRepository courseRepository;
    private final CourseReviewRepository courseReviewRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void addToWishlist(Long courseId, String studentEmail) {
        User student = findStudent(studentEmail);
        Course course = findPublishedCourse(courseId);
        if (wishlistRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            throw new BadRequestException("Course is already in your wishlist");
        }
        wishlistRepository.save(WishlistItem.builder().student(student).course(course).build());
    }

    @Override
    @Transactional
    public void removeFromWishlist(Long courseId, String studentEmail) {
        User student = findStudent(studentEmail);
        if (!wishlistRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            throw new BadRequestException("Course is not in your wishlist");
        }
        wishlistRepository.deleteByStudentIdAndCourseId(student.getId(), courseId);
    }

    @Override
    public Page<PublishedCourseItem> myWishlist(String studentEmail, int page, int size) {
        User student = findStudent(studentEmail);
        Pageable pageable = CoursePageableUtil.forCatalog(page, size, "createdAt", "desc");
        Page<WishlistItem> items = wishlistRepository.findByStudentIdOrderByCreatedAtDesc(student.getId(), pageable);
        List<Course> courses = items.getContent().stream().map(WishlistItem::getCourse).toList();
        Map<Long, CourseRatingAggregate> ratings = batchRatings(courses);
        Set<Long> allWishlisted = new HashSet<>(courses.stream().map(Course::getId).toList());
        return items.map(w -> toPublishedItem(w.getCourse(), ratings, allWishlisted));
    }

    private User findStudent(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getRole().getName() != RoleName.STUDENT) {
            throw new BadRequestException("Operation requires role: STUDENT");
        }
        return user;
    }

    private Course findPublishedCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        if (course.getStatus() != CourseStatus.PUBLISHED || !course.isActive()) {
            throw new BadRequestException("Only published courses can be wishlisted");
        }
        return course;
    }

    private Map<Long, CourseRatingAggregate> batchRatings(List<Course> courses) {
        if (courses.isEmpty()) {
            return Map.of();
        }
        List<Long> ids = courses.stream().map(Course::getId).toList();
        return courseReviewRepository.aggregateRatingsByCourseIds(ids).stream()
                .collect(Collectors.toMap(CourseRatingAggregate::getCourseId, Function.identity()));
    }

    private PublishedCourseItem toPublishedItem(Course course, Map<Long, CourseRatingAggregate> ratings, Set<Long> wishlisted) {
        CourseRatingAggregate agg = ratings.get(course.getId());
        double avg = agg != null && agg.getAverageRating() != null ? Math.round(agg.getAverageRating() * 10.0) / 10.0 : 0.0;
        long count = agg != null && agg.getReviewCount() != null ? agg.getReviewCount() : 0L;
        return new PublishedCourseItem(
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
                count > 0 ? avg : null,
                count,
                wishlisted.contains(course.getId())
        );
    }
}
