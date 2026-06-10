package com.ailms.wishlist.service;

import com.ailms.course.dto.PublishedCourseItem;
import org.springframework.data.domain.Page;

public interface WishlistService {

    void addToWishlist(Long courseId, String studentEmail);

    void removeFromWishlist(Long courseId, String studentEmail);

    Page<PublishedCourseItem> myWishlist(String studentEmail, int page, int size);
}
