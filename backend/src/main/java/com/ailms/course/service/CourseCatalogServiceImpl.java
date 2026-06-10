package com.ailms.course.service;

import com.ailms.common.enums.RoleName;
import com.ailms.common.exception.BadRequestException;
import com.ailms.common.exception.ResourceNotFoundException;
import com.ailms.common.util.CoursePageableUtil;
import com.ailms.course.dto.CourseRatingAggregate;
import com.ailms.course.dto.CourseReviewResponse;
import com.ailms.course.dto.CreateCourseReviewRequest;
import com.ailms.course.dto.PublishedCourseItem;
import com.ailms.course.entity.Course;
import com.ailms.course.entity.CourseReview;
import com.ailms.course.enums.CourseLevel;
import com.ailms.course.enums.CourseStatus;
import com.ailms.course.repository.CourseRepository;
import com.ailms.course.repository.CourseReviewRepository;
import com.ailms.course.spec.CourseSpecifications;
import com.ailms.enrollment.repository.EnrollmentRepository;
import com.ailms.user.entity.User;
import com.ailms.user.repository.UserRepository;
import com.ailms.wishlist.repository.WishlistRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CourseCatalogServiceImpl implements CourseCatalogService {

    private final CourseRepository courseRepository;
    private final CourseReviewRepository courseReviewRepository;
    private final WishlistRepository wishlistRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    @Override
    public Page<PublishedCourseItem> searchPublishedCourses(
            String q,
            CourseLevel level,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Double minRating,
            int page,
            int size,
            String sortBy,
            String direction,
            Long studentIdOrNull
    ) {
        Specification<Course> spec = Specification.where(CourseSpecifications.publishedAndActive());
        if (StringUtils.hasText(q)) {
            spec = spec.and(CourseSpecifications.titleOrDescriptionContains(q.trim()));
        }
        if (level != null) {
            spec = spec.and(CourseSpecifications.levelEquals(level));
        }
        if (minPrice != null) {
            spec = spec.and(CourseSpecifications.priceAtLeast(minPrice));
        }
        if (maxPrice != null) {
            spec = spec.and(CourseSpecifications.priceAtMost(maxPrice));
        }
        if (minRating != null && minRating > 0) {
            spec = spec.and(CourseSpecifications.minAverageRating(minRating));
        }

        Pageable pageable = CoursePageableUtil.forCatalog(page, size, sortBy, direction);
        Page<Course> result = courseRepository.findAll(spec, pageable);
        Map<Long, CourseRatingAggregate> ratings = batchRatings(result.getContent());
        Set<Long> wishlisted = batchWishlistedCourseIds(studentIdOrNull, result.getContent());
        return result.map(course -> toPublishedItem(course, ratings, wishlisted));
    }

    @Override
    public List<PublishedCourseItem> feedPublishedCourses(Long cursorId, int size, Long studentIdOrNull) {
        int pageSize = Math.min(Math.max(size, 1), 50);
        Page<Course> page;
        if (cursorId == null || cursorId <= 0) {
            page = courseRepository.findByStatusAndActiveTrueOrderByIdDesc(
                    CourseStatus.PUBLISHED,
                    PageRequest.of(0, pageSize)
            );
        } else {
            page = courseRepository.findByStatusAndActiveTrueAndIdLessThanOrderByIdDesc(
                    CourseStatus.PUBLISHED,
                    cursorId,
                    PageRequest.of(0, pageSize)
            );
        }
        List<Course> content = page.getContent();
        Map<Long, CourseRatingAggregate> ratings = batchRatings(content);
        Set<Long> wishlisted = batchWishlistedCourseIds(studentIdOrNull, content);
        return content.stream().map(c -> toPublishedItem(c, ratings, wishlisted)).toList();
    }

    @Override
    public Page<CourseReviewResponse> listCourseReviews(Long courseId, int page, int size) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        if (course.getStatus() != CourseStatus.PUBLISHED || !course.isActive()) {
            throw new ResourceNotFoundException("Published course not found");
        }
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(Math.max(size, 1), 50));
        return courseReviewRepository.findByCourseIdOrderByCreatedAtDesc(courseId, pageable)
                .map(this::toReviewResponse);
    }

    @Override
    @Transactional
    public CourseReviewResponse upsertReview(Long courseId, CreateCourseReviewRequest request, String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (student.getRole().getName() != RoleName.STUDENT) {
            throw new BadRequestException("Operation requires role: STUDENT");
        }
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        if (course.getStatus() != CourseStatus.PUBLISHED || !course.isActive()) {
            throw new BadRequestException("You can only review published courses");
        }
        if (!enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            throw new BadRequestException("You must be enrolled to leave a review");
        }

        CourseReview review = courseReviewRepository.findByStudentIdAndCourseId(student.getId(), courseId)
                .orElseGet(() -> CourseReview.builder().course(course).student(student).build());
        review.setRating(request.rating());
        review.setComment(request.comment());
        review.setUpdatedAt(LocalDateTime.now());
        CourseReview saved = courseReviewRepository.save(review);
        return toReviewResponse(saved);
    }

    private Map<Long, CourseRatingAggregate> batchRatings(List<Course> courses) {
        if (courses.isEmpty()) {
            return Map.of();
        }
        List<Long> ids = courses.stream().map(Course::getId).toList();
        List<CourseRatingAggregate> aggregates = courseReviewRepository.aggregateRatingsByCourseIds(ids);
        return aggregates.stream()
                .collect(Collectors.toMap(CourseRatingAggregate::getCourseId, Function.identity()));
    }

    private Set<Long> batchWishlistedCourseIds(Long studentId, List<Course> courses) {
        if (studentId == null || courses.isEmpty()) {
            return Set.of();
        }
        List<Long> ids = courses.stream().map(Course::getId).toList();
        if (ids.isEmpty()) {
            return Set.of();
        }
        return new HashSet<>(wishlistRepository.findWishlistedCourseIds(studentId, ids));
    }

    private PublishedCourseItem toPublishedItem(Course course, Map<Long, CourseRatingAggregate> ratings, Set<Long> wishlisted) {
        CourseRatingAggregate agg = ratings.get(course.getId());
        double avg = agg != null && agg.getAverageRating() != null ? round1(agg.getAverageRating()) : 0.0;
        long count = agg != null && agg.getReviewCount() != null ? agg.getReviewCount() : 0L;
        boolean inWishlist = wishlisted.contains(course.getId());

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
                inWishlist
        );
    }

    private double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }

    private CourseReviewResponse toReviewResponse(CourseReview r) {
        return new CourseReviewResponse(
                r.getId(),
                r.getCourse().getId(),
                r.getStudent().getId(),
                r.getStudent().getFullName(),
                r.getRating(),
                r.getComment(),
                r.getCreatedAt()
        );
    }
}
