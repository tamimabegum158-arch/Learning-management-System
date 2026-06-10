package com.ailms.course.spec;

import com.ailms.course.entity.Course;
import com.ailms.course.entity.CourseReview;
import com.ailms.course.enums.CourseLevel;
import com.ailms.course.enums.CourseStatus;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import java.math.BigDecimal;
import org.springframework.data.jpa.domain.Specification;

public final class CourseSpecifications {

    private CourseSpecifications() {
    }

    public static Specification<Course> publishedAndActive() {
        return (root, query, cb) -> cb.and(
                cb.equal(root.get("status"), CourseStatus.PUBLISHED),
                cb.isTrue(root.get("active"))
        );
    }

    public static Specification<Course> titleOrDescriptionContains(String q) {
        String pattern = "%" + q.trim().toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("title")), pattern),
                cb.like(cb.lower(root.get("description")), pattern)
        );
    }

    public static Specification<Course> levelEquals(CourseLevel level) {
        return (root, query, cb) -> cb.equal(root.get("level"), level);
    }

    public static Specification<Course> priceAtLeast(BigDecimal minPrice) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("price"), minPrice);
    }

    public static Specification<Course> priceAtMost(BigDecimal maxPrice) {
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("price"), maxPrice);
    }

    public static Specification<Course> minAverageRating(double minRating) {
        return (root, query, cb) -> {
            Subquery<Double> avgSub = query.subquery(Double.class);
            Root<CourseReview> reviewRoot = avgSub.from(CourseReview.class);
            avgSub.select(cb.avg(reviewRoot.get("rating")));
            avgSub.where(cb.equal(reviewRoot.get("course"), root));
            return cb.greaterThanOrEqualTo(cb.coalesce(avgSub, 0.0), minRating);
        };
    }
}
