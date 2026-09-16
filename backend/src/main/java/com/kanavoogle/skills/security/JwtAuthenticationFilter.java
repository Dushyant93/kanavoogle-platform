package com.kanavoogle.skills.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.util.*;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    public static final String COOKIE_NAME = "KANAVOOGLE_SESSION";
    private final JwtService jwt;

    public JwtAuthenticationFilter(JwtService j) {
        jwt = j;
    }

    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) throws ServletException, IOException {
        try {
            String t = cookie(req);
            if (t != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                AuthenticatedUser u = jwt.parse(t);
                SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(u, null, List.of(new SimpleGrantedAuthority("ROLE_" + u.role().name()))));
            }
        } catch (Exception e) {
            SecurityContextHolder.clearContext();
        }
        chain.doFilter(req, res);
    }

    private String cookie(HttpServletRequest r) {
        if (r.getCookies() == null) return null;
        return Arrays.stream(r.getCookies()).filter(c -> COOKIE_NAME.equals(c.getName())).map(Cookie::getValue).findFirst().orElse(null);
    }
}
