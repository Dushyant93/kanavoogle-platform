package com.kanavoogle.skills.security;

import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {
    private SecurityUtils() {
    }

    public static AuthenticatedUser current() {
        Object p = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(p instanceof AuthenticatedUser u)) throw new IllegalStateException("No authenticated user");
        return u;
    }
}
