package com.ailms.security;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;

public final class SecurityUtil {

    private SecurityUtil() {
    }

    /**
     * Returns the authenticated student's user id for catalog personalization (wishlist flags), or null.
     */
    public static Long optionalStudentId(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return null;
        }
        boolean student = authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_STUDENT".equals(a.getAuthority()));
        if (!student) {
            return null;
        }
        if (authentication.getPrincipal() instanceof AppUserPrincipal principal) {
            return principal.getId();
        }
        return null;
    }
}
