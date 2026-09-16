package com.kanavoogle.skills.security;

import com.kanavoogle.skills.config.AppProperties;
import com.kanavoogle.skills.user.*;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import java.nio.charset.StandardCharsets;
import java.time.*;
import java.util.Date;
import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private final AppProperties p;

    public JwtService(AppProperties p) {
        this.p = p;
    }

    private SecretKey key() {
        byte[] b = p.getSecurity().getJwtSecret().getBytes(StandardCharsets.UTF_8);
        if (b.length < 32) throw new IllegalStateException("JWT_SECRET must be at least 32 bytes");
        return Keys.hmacShaKeyFor(b);
    }

    public String issue(UserAccount u) {
        Instant n = Instant.now(), e = n.plusSeconds(p.getSecurity().getJwtTtlMinutes() * 60);
        return Jwts.builder().subject(u.getId()).claim("email", u.getEmail()).claim("role", u.getRole().name()).issuedAt(Date.from(n)).expiration(Date.from(e)).signWith(key()).compact();
    }

    public AuthenticatedUser parse(String t) {
        Claims c = Jwts.parser().verifyWith(key()).build().parseSignedClaims(t).getPayload();
        return new AuthenticatedUser(c.getSubject(), c.get("email", String.class), Role.valueOf(c.get("role", String.class)));
    }
}
