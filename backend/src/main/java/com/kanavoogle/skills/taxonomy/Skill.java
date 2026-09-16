package com.kanavoogle.skills.taxonomy;

import java.util.*;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("skills")
public class Skill {
    @Id
    private String id;
    @Indexed(unique = true)
    private String code;
    private String name, description;
    private boolean active = true;
    private List<SubSkill> subSkills = new ArrayList<>();

    public String getId() {
        return id;
    }

    public void setId(String v) {
        id = v;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String v) {
        code = v;
    }

    public String getName() {
        return name;
    }

    public void setName(String v) {
        name = v;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String v) {
        description = v;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean v) {
        active = v;
    }

    public List<SubSkill> getSubSkills() {
        return subSkills;
    }

    public void setSubSkills(List<SubSkill> v) {
        subSkills = v;
    }

    public static class SubSkill {
        private String id, name;
        private boolean active = true;

        public SubSkill() {
        }

        public SubSkill(String i, String n) {
            id = i;
            name = n;
        }

        public String getId() {
            return id;
        }

        public void setId(String v) {
            id = v;
        }

        public String getName() {
            return name;
        }

        public void setName(String v) {
            name = v;
        }

        public boolean isActive() {
            return active;
        }

        public void setActive(boolean v) {
            active = v;
        }
    }
}
