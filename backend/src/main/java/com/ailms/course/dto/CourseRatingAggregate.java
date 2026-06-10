package com.ailms.course.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CourseRatingAggregate {

    private Long courseId;
    private Double averageRating;
    private Long reviewCount;
}
