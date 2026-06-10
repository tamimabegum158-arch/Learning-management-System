package com.ailms.wishlist.controller;

import com.ailms.common.dto.ApiResponse;
import com.ailms.course.dto.PublishedCourseItem;
import com.ailms.wishlist.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/student/wishlist")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class WishlistController {

    private final WishlistService wishlistService;

    @PostMapping("/{courseId}")
    public ResponseEntity<ApiResponse<Void>> add(
            @PathVariable Long courseId,
            Authentication authentication
    ) {
        wishlistService.addToWishlist(courseId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Course added to wishlist", null));
    }

    @DeleteMapping("/{courseId}")
    public ResponseEntity<ApiResponse<Void>> remove(
            @PathVariable Long courseId,
            Authentication authentication
    ) {
        wishlistService.removeFromWishlist(courseId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Course removed from wishlist", null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PublishedCourseItem>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Wishlist fetched successfully",
                wishlistService.myWishlist(authentication.getName(), page, size)
        ));
    }
}
