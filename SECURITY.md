# CINEMETA — Cybersecurity & Architecture Documentation

## 1. Overview
CINEMETA incorporates defense-in-depth cybersecurity controls across client-side interfaces and backend Express/Node services to safeguard user credentials, interaction vectors, and metadata retrieval pipelines.

---

## 2. Authentication & Credential Security

### Password Hashing with Bcrypt
- User passwords are never stored in plaintext.
- All passwords undergo asynchronous hashing via `bcryptjs` using a minimum salt factor of **10 rounds**.
- Cryptographic salt generation ensures protection against rainbow table attacks and precomputed dictionary lookups.

### Password Complexity Standards
Registration enforces strict password policies:
- Minimum length of **8 characters**
- At least one **uppercase letter** (`A-Z`)
- At least one **lowercase letter** (`a-z`)
- At least one **numeric digit** (`0-9`)
- At least one **special character** (`!@#$%^&*...`)

### JSON Web Token (JWT) Authentication
- Sessions are managed statelessly using cryptographically signed **JSON Web Tokens (JWT)** (`HS256` algorithm).
- Tokens expire automatically after **7 days**.
- The `authenticateToken` middleware verifies token validity and unpacks the user context onto `req.user` without exposing password hashes.

---

## 3. Brute-Force & Denial-of-Service (DoS) Mitigation

### Dynamic Auth Rate Limiting
- Login attempts are tracked per email/IP composite key using a sliding time window.
- If more than **5 failed attempts** occur within a **15-minute window**, the endpoint responds with HTTP `429 Too Many Requests` and enforces an exponential lock-out duration.
- Successful authentications reset the failed attempt counter.

### Request Payload Limiting
- Express body parsing is explicitly constrained to `1mb` to prevent payload-based resource exhaustion attacks.

---

## 4. Input Sanitization & Injection Defense

### String & HTML Sanitization
- All user-supplied text inputs (names, reviews, comments) pass through `sanitizeString()` which strips angle brackets, control characters, and dangerous payload scripts to prevent Cross-Site Scripting (XSS).
- Email addresses are normalized, trimmed, and validated against standard RFC regex formats.

### Safe Query & Parameter Handling
- Movie IDs and ratings are strictly parsed into numeric primitives (`Number(id)`) before database queries to prevent NoSQL/in-memory parameter pollution.

---

## 5. HTTP Security Headers

The following security response headers are enforced across all HTTP responses:
- `X-Content-Type-Options: nosniff` — Prevents MIME-type sniffing.
- `X-Frame-Options: SAMEORIGIN` — Mitigates clickjacking attacks.
- `X-XSS-Protection: 1; mode=block` — Enforces legacy browser XSS filters.
- `Referrer-Policy: strict-origin-when-cross-origin` — Protects referral URLs.
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` — Mandates encrypted HTTPS connections.

---

## 6. Machine Learning Recommendation Privacy
- The recommendation engine computes user preference vectors strictly on the server or in memory.
- Watched, disliked, and existing library movies are deterministically excluded from output sets to ensure privacy and avoid recommendation redundancy.
