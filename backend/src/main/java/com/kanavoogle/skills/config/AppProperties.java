package com.kanavoogle.skills.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    private final Security security = new Security();
    private final Llm llm = new Llm();

    public Security getSecurity() {
        return security;
    }

    public Llm getLlm() {
        return llm;
    }

    public static class Security {
        private String jwtSecret;
        private long jwtTtlMinutes = 480;
        private boolean cookieSecure;
        private String allowedOrigins;

        public String getJwtSecret() {
            return jwtSecret;
        }

        public void setJwtSecret(String v) {
            jwtSecret = v;
        }

        public long getJwtTtlMinutes() {
            return jwtTtlMinutes;
        }

        public void setJwtTtlMinutes(long v) {
            jwtTtlMinutes = v;
        }

        public boolean isCookieSecure() {
            return cookieSecure;
        }

        public void setCookieSecure(boolean v) {
            cookieSecure = v;
        }

        public String getAllowedOrigins() {
            return allowedOrigins;
        }

        public void setAllowedOrigins(String v) {
            allowedOrigins = v;
        }
    }

    public static class Llm {
        private boolean enabled;
        private String baseUrl;
        private String apiKey;
        private String model;

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean v) {
            enabled = v;
        }

        public String getBaseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(String v) {
            baseUrl = v;
        }

        public String getApiKey() {
            return apiKey;
        }

        public void setApiKey(String v) {
            apiKey = v;
        }

        public String getModel() {
            return model;
        }

        public void setModel(String v) {
            model = v;
        }
    }
}
