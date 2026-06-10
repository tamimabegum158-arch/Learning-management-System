package com.ailms.common.util;

import java.util.Set;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public final class CoursePageableUtil {

    private static final Set<String> ALLOWED_SORT = Set.of("createdAt", "price", "title", "id");

    private CoursePageableUtil() {
    }

    public static Pageable forCatalog(int page, int size, String sortBy, String direction) {
        String property = ALLOWED_SORT.contains(sortBy) ? sortBy : "createdAt";
        Sort.Direction sortDirection = "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
        return PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), Sort.by(sortDirection, property));
    }
}
