package com.kanavoogle.skills.user;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("users")
public class UserAccount {
    @Id
    private String id;
    @Indexed(unique = true)
    private String email;
    private String passwordHash;
    private String displayName;
    private Role role;
    private VerificationStatus verificationStatus;
    private StudentProfile studentProfile;
    private SchoolProfile schoolProfile;
    private EmployerProfile employerProfile;
    private Instant createdAt;

    public String getId() {
        return id;
    }

    public void setId(String v) {
        id = v;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String v) {
        email = v;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String v) {
        passwordHash = v;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String v) {
        displayName = v;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role v) {
        role = v;
    }

    public VerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(VerificationStatus v) {
        verificationStatus = v;
    }

    public StudentProfile getStudentProfile() {
        return studentProfile;
    }

    public void setStudentProfile(StudentProfile v) {
        studentProfile = v;
    }

    public SchoolProfile getSchoolProfile() {
        return schoolProfile;
    }

    public void setSchoolProfile(SchoolProfile v) {
        schoolProfile = v;
    }

    public EmployerProfile getEmployerProfile() {
        return employerProfile;
    }

    public void setEmployerProfile(EmployerProfile v) {
        employerProfile = v;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant v) {
        createdAt = v;
    }

    public static class StudentProfile {
        private Integer age, yearLevel;
        private String schoolName, region, bio, degree, cohort, expectedGraduation, photo;
        private boolean skillSharingConsent;
        private boolean publicProfile;

        public Integer getAge() {
            return age;
        }

        public void setAge(Integer v) {
            age = v;
        }

        public Integer getYearLevel() {
            return yearLevel;
        }

        public void setYearLevel(Integer v) {
            yearLevel = v;
        }

        public String getSchoolName() {
            return schoolName;
        }

        public void setSchoolName(String v) {
            schoolName = v;
        }

        public String getRegion() {
            return region;
        }

        public void setRegion(String v) {
            region = v;
        }

        public boolean isSkillSharingConsent() {
            return skillSharingConsent;
        }

        public void setSkillSharingConsent(boolean v) {
            skillSharingConsent = v;
        }

        public String getBio() {
            return bio;
        }

        public void setBio(String v) {
            bio = v;
        }

        public String getDegree() {
            return degree;
        }

        public void setDegree(String v) {
            degree = v;
        }

        public String getCohort() {
            return cohort;
        }

        public void setCohort(String v) {
            cohort = v;
        }

        public String getExpectedGraduation() {
            return expectedGraduation;
        }

        public void setExpectedGraduation(String v) {
            expectedGraduation = v;
        }

        public String getPhoto() {
            return photo;
        }

        public void setPhoto(String v) {
            photo = v;
        }

        public boolean isPublicProfile() {
            return publicProfile;
        }

        public void setPublicProfile(boolean v) {
            publicProfile = v;
        }
    }

    public static class SchoolProfile {
        private String schoolName, location, contactPerson, officialEmail;

        public String getSchoolName() {
            return schoolName;
        }

        public void setSchoolName(String v) {
            schoolName = v;
        }

        public String getLocation() {
            return location;
        }

        public void setLocation(String v) {
            location = v;
        }

        public String getContactPerson() {
            return contactPerson;
        }

        public void setContactPerson(String v) {
            contactPerson = v;
        }

        public String getOfficialEmail() {
            return officialEmail;
        }

        public void setOfficialEmail(String v) {
            officialEmail = v;
        }
    }

    public static class EmployerProfile {
        private String businessName, region, contactPerson, organisationRole;

        public String getBusinessName() {
            return businessName;
        }

        public void setBusinessName(String v) {
            businessName = v;
        }

        public String getRegion() {
            return region;
        }

        public void setRegion(String v) {
            region = v;
        }

        public String getContactPerson() {
            return contactPerson;
        }

        public void setContactPerson(String v) {
            contactPerson = v;
        }

        public String getOrganisationRole() {
            return organisationRole;
        }

        public void setOrganisationRole(String v) {
            organisationRole = v;
        }
    }
}
