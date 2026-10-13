package com.kanavoogle.skills.auth;

import com.kanavoogle.skills.config.AppProperties;
import com.kanavoogle.skills.repository.LocationRepository;
import com.kanavoogle.skills.security.*;
import com.kanavoogle.skills.user.*;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.*;
import java.util.Locale;

import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final AppProperties props;
    private final LocationRepository locations;

    public record Login(@Email @NotBlank String email, @NotBlank String password) {
    }

    public record StudentReg(@NotBlank String displayName, @Email @NotBlank String email,
                             @Size(min = 10) String password, @Min(13) @Max(19) int age, @Min(7) @Max(12) int yearLevel,
                             @NotBlank String schoolName, @NotBlank String state,
                             @NotBlank String suburb, @Pattern(regexp = "\\d{4}") String postcode,
                             boolean skillSharingConsent) {
    }

    public record SchoolReg(@NotBlank String displayName, @Email @NotBlank String email,
                            @Size(min = 10) String password, @NotBlank String schoolName, @NotBlank String location,
                            @NotBlank String contactPerson, @Email String officialEmail) {
    }

    public record EmployerReg(@NotBlank String displayName, @Email @NotBlank String email,
                              @Size(min = 10) String password, @NotBlank String businessName, @NotBlank String region,
                              @NotBlank String contactPerson, @NotBlank String organisationRole) {
    }

    public record ProfileUpdate(@NotBlank @Size(max = 120) String displayName,
                                @Email @NotBlank String email,
                                @NotBlank @Size(max = 160) String schoolName,
                                @Size(max = 160) String bio,
                                @Size(max = 120) String degree,
                                @Size(max = 80) String cohort,
                                @Size(max = 80) String expectedGraduation,
                                boolean publicProfile,
                                boolean skillSharingConsent,
                                String photo) {
    }

    @PostMapping("/register/student")
    public UserAccount student(@Valid @RequestBody StudentReg r, HttpServletResponse res) {
        validateLocation(
                r.state(),
                r.suburb(),
                r.postcode()
        );
        UserAccount u = base(r.displayName(), r.email(), r.password(), Role.STUDENT, VerificationStatus.NOT_REQUIRED);
        UserAccount.StudentProfile p = new UserAccount.StudentProfile();
        p.setAge(r.age());
        p.setYearLevel(r.yearLevel());
        p.setSchoolName(r.schoolName());
        //p.setRegion(r.region());
        p.setState(r.state().trim().toUpperCase(Locale.ROOT));
        p.setSuburb(r.suburb().trim());
        p.setPostcode(r.postcode().trim());
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

    @PutMapping("/profile")
    public UserAccount updateProfile(@Valid @RequestBody ProfileUpdate r, HttpServletResponse res) {
        UserAccount u = users.findById(SecurityUtils.current().userId()).orElseThrow();
        if (u.getRole() != Role.STUDENT || u.getStudentProfile() == null) {
            throw new SecurityException("Student role required");
        }

        String normalizedEmail =
                r.email()
                        .trim()
                        .toLowerCase(Locale.ROOT);

        final String currentUserId = u.getId();

        users.findByEmailIgnoreCase(normalizedEmail)
                .filter(existing ->
                        !existing.getId().equals(currentUserId))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException(
                            "Email already registered"
                    );
                });

        if (r.photo() != null) {
            if (r.photo().length() > 1_200_000) {
                throw new IllegalArgumentException("Profile photo is too large");
            }
            String lowerPhoto = r.photo().toLowerCase(Locale.ROOT);
            boolean supportedPhoto = lowerPhoto.startsWith("data:image/jpeg;base64,")
                    || lowerPhoto.startsWith("data:image/png;base64,")
                    || lowerPhoto.startsWith("data:image/gif;base64,");
            if (!supportedPhoto) {
                throw new IllegalArgumentException("Profile photo must be JPG, PNG, or GIF");
            }
        }

        u.setDisplayName(r.displayName().trim());
        u.setEmail(normalizedEmail);
        UserAccount.StudentProfile p = u.getStudentProfile();
        p.setSchoolName(r.schoolName().trim());
        p.setBio(trimToNull(r.bio()));
        p.setDegree(trimToNull(r.degree()));
        p.setCohort(trimToNull(r.cohort()));
        p.setExpectedGraduation(trimToNull(r.expectedGraduation()));
        p.setPublicProfile(r.publicProfile());
        p.setSkillSharingConsent(r.skillSharingConsent());
        p.setPhoto(trimToNull(r.photo()));

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
        res.addHeader(HttpHeaders.SET_COOKIE, ResponseCookie.from(JwtAuthenticationFilter.COOKIE_NAME, "").httpOnly(true).secure(props.getSecurity().isCookieSecure()).sameSite("Strict").path("/").maxAge(Duration.ZERO).build().toString());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public UserAccount me() {
        return safe(users.findById(SecurityUtils.current().userId()).orElseThrow());
    }

    private UserAccount base(String n, String e, String pass, Role role, VerificationStatus status) {
        String normalizedEmail = e.trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmailIgnoreCase(normalizedEmail)) throw new IllegalArgumentException("Email already registered");
        UserAccount u = new UserAccount();
        u.setDisplayName(n.trim());
        u.setEmail(normalizedEmail);
        u.setPasswordHash(encoder.encode(pass));
        u.setRole(role);
        u.setVerificationStatus(status);
        u.setCreatedAt(Instant.now());
        return u;
    }

    private void cookie(UserAccount u, HttpServletResponse r) {
        r.addHeader(HttpHeaders.SET_COOKIE, ResponseCookie.from(JwtAuthenticationFilter.COOKIE_NAME, jwt.issue(u)).httpOnly(true).secure(props.getSecurity().isCookieSecure()).sameSite("Strict").path("/").maxAge(Duration.ofMinutes(props.getSecurity().getJwtTtlMinutes())).build().toString());
    }

    private UserAccount safe(UserAccount u) {
        u.setPasswordHash(null);
        return u;
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private void validateLocation(
            String state,
            String suburb,
            String postcode) {

        String normalizedState = state.trim().toUpperCase(Locale.ROOT);

        boolean valid = locations.existsByStateAndSuburbIgnoreCaseAndPostcode(
                normalizedState,
                suburb.trim(),
                postcode.trim()
        );

        if (!valid) {
            throw new IllegalArgumentException(
                    "Please select a valid suburb and postcode from the location search"
            );
        }
    }
}
