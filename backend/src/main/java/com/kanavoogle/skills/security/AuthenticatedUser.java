package com.kanavoogle.skills.security;

import com.kanavoogle.skills.user.Role;

public record AuthenticatedUser(String userId, String email, Role role) {
}
