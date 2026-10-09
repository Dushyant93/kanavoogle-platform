package com.kanavoogle.skills.auth;

import com.kanavoogle.skills.config.AppProperties;
import com.kanavoogle.skills.security.*;
import com.kanavoogle.skills.user.*;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.*;
import java.util.Locale;

import org.springframework.http.*;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final AppProperties props;

    public AuthController(UserRepository u, PasswordEncoder e, JwtService j, AppProperties p) {
        users = u;
        encoder = e;
        jwt = j;
        props = p;
    }

    public record Login(@Email @NotBlank String email, @NotBlank String password) {
    }

    public record StudentReg(@NotBlank String displayName, @Email @NotBlank String email,
                             @Size(min = 10) String password, @Min(13) @Max(19) int age, @Min(7) @Max(12) int yearLevel,
                             @NotBlank String schoolName, @NotBlank String region, boolean skillSharingConsent) {
    }

    public record SchoolReg(@NotBlank String displayName, @Email @NotBlank String email,
                            @Size(min = 10) String password, @NotBlank String schoolName, @NotBlank String location,
                            @NotBlank String contactPerson, @Email String officialEmail) {
    }

    public record EmployerReg(@NotBlank String displayName, @Email @NotBlank String email,
                              @Size(min = 10) String password, @NotBlank String businessName, @NotBlank String region,
                              @NotBlank String contactPerson, @NotBlank String organisationRole) {
    }

    public record ProfileUpdate(@NotBlank String displayName, @Email @NotBlank String email,
                                @NotBlank String schoolName, @Size(max = 160) String bio, @Size(max = 120) String degree,
                                @Size(max = 40) String cohort, @Size(max = 40) String expectedGraduation,
                                boolean publicProfile, boolean skillSharingConsent, String photo) {
    }

    @PostMapping("/register/student")
    public UserAccount student(@Valid @RequestBody StudentReg r, HttpServletResponse res) {
        UserAccount u = base(r.displayName(), r.email(), r.password(), Role.STUDENT, VerificationStatus.NOT_REQUIRED);
        UserAccount.StudentProfile p = new UserAccount.StudentProfile();
        p.setAge(r.age());
        p.setYearLevel(r.yearLevel());
        p.setSchoolName(r.schoolName());
        p.setRegion(r.region());
        p.setSkillSharingConsent(r.skillSharingConsent());
        u.setStudentProfile(p);
        u = users.save(u);
        cookie(u, res);
        return safe(u);
    }

    @PostMapping("/register/school")
    public UserAccount school(@Valid @RequestBody SchoolReg r, HttpServletResponse res) {
        UserAccount u = base(r.displayName(), r.email(), r.password(), Role.SCHOOL, VerificationStatus.PENDING);
        UserAccount.SchoolProfile p = new UserAccount.SchoolProfile();
        p.setSchoolName(r.schoolName());
        p.setLocation(r.location());
        p.setContactPerson(r.contactPerson());
        p.setOfficialEmail(r.officialEmail());
        u.setSchoolProfile(p);
        u = users.save(u);
        cookie(u, res);
        return safe(u);
    }

    @PostMapping("/register/employer")
    public UserAccount employer(@Valid @RequestBody EmployerReg r, HttpServletResponse res) {
        UserAccount u = base(r.displayName(), r.email(), r.password(), Role.EMPLOYER, VerificationStatus.PENDING);
        UserAccount.EmployerProfile p = new UserAccount.EmployerProfile();
        p.setBusinessName(r.businessName());
        p.setRegion(r.region());
        p.setContactPerson(r.contactPerson());
        p.setOrganisationRole(r.organisationRole());
        u.setEmployerProfile(p);
        u = users.save(u);
        cookie(u, res);
        return safe(u);
    }

    @PostMapping("/login")
    public UserAccount login(@Valid @RequestBody Login r, HttpServletResponse res) {
        UserAccount u = users.findByEmailIgnoreCase(r.email()).orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        if (!encoder.matches(r.password(), u.getPasswordHash()))
            throw new BadCredentialsException("Invalid credentials");
        cookie(u, res);
        return safe(u);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse res) {
        res.addHeader(HttpHeaders.SET_COOKIE, ResponseCookie.from(JwtAuthenticationFilter.COOKIE_NAME, "").httpOnly(true).secure(props.getSecurity().isCookieSecure()).sameSite("Lax").path("/").maxAge(Duration.ZERO).build().toString());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public UserAccount me() {
        return safe(users.findById(SecurityUtils.current().userId()).orElseThrow());
    }

    @PutMapping("/me")
    public UserAccount update(@Valid @RequestBody ProfileUpdate r) {
        UserAccount u = users.findById(SecurityUtils.current().userId()).orElseThrow();
        if (u.getRole() != Role.STUDENT) throw new SecurityException("Student role required");
        String email = r.email().trim().toLowerCase(Locale.ROOT);
        if (!email.equals(u.getEmail()) && users.existsByEmailIgnoreCase(email))
            throw new IllegalArgumentException("Email already registered");
        String photo = r.photo() == null ? null : r.photo().trim();
        if (photo != null && !photo.isEmpty()) {
            if (!photo.startsWith("data:image/") || photo.length() > 1_200_000)
                throw new IllegalArgumentException("Photo must be a JPG, GIF, or PNG under 800K");
        } else {
            photo = null;
        }
        u.setDisplayName(r.displayName().trim());
        u.setEmail(email);
        UserAccount.StudentProfile p = u.getStudentProfile();
        if (p == null) {
            p = new UserAccount.StudentProfile();
            u.setStudentProfile(p);
        }
        p.setSchoolName(r.schoolName().trim());
        p.setBio(blankToNull(r.bio()));
        p.setDegree(blankToNull(r.degree()));
        p.setCohort(blankToNull(r.cohort()));
        p.setExpectedGraduation(blankToNull(r.expectedGraduation()));
        p.setPublicProfile(r.publicProfile());
        p.setSkillSharingConsent(r.skillSharingConsent());
        p.setPhoto(photo);
        return safe(users.save(u));
    }

    private String blankToNull(String v) {
        if (v == null) return null;
        String x = v.trim();
        return x.isEmpty() ? null : x;
    }

    private UserAccount base(String n, String e, String pass, Role role, VerificationStatus status) {
        if (users.existsByEmailIgnoreCase(e)) throw new IllegalArgumentException("Email already registered");
        UserAccount u = new UserAccount();
        u.setDisplayName(n.trim());
        u.setEmail(e.trim().toLowerCase(Locale.ROOT));
        u.setPasswordHash(encoder.encode(pass));
        u.setRole(role);
        u.setVerificationStatus(status);
        u.setCreatedAt(Instant.now());
        return u;
    }

    private void cookie(UserAccount u, HttpServletResponse r) {
        r.addHeader(HttpHeaders.SET_COOKIE, ResponseCookie.from(JwtAuthenticationFilter.COOKIE_NAME, jwt.issue(u)).httpOnly(true).secure(props.getSecurity().isCookieSecure()).sameSite("Lax").path("/").maxAge(Duration.ofMinutes(props.getSecurity().getJwtTtlMinutes())).build().toString());
    }

    private UserAccount safe(UserAccount u) {
        u.setPasswordHash(null);
        return u;
    }
}
