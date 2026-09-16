# Security notes

Implemented: BCrypt password hashing, HttpOnly JWT cookie, role-based backend authorization, DTO validation, CORS allow-list, CSP/frame/no-referrer headers, server-side LLM secrets, bounded assessment context, and off-chain storage of raw responses.

Production hardening still required: HTTPS with `COOKIE_SECURE=true`, high-entropy secrets from a secret manager, rate limiting/account lockout, email verification/password reset, audit logging, organisation verification workflow, dependency/SAST scans, penetration testing, and explicit CSRF tokens if cross-site cookies are introduced.
