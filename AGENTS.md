<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

# Nazexa Central Authentication System — Agent Context & Integration Guide

This section serves as the canonical architectural context for AI coding agents and engineers working on or integrating with **Nazexa Web** (`nazexa-web`), the central identity provider and Single Sign-On (SSO) hub for the entire Nazexa product ecosystem.

---

## 1. Overview & Architectural Role

`nazexa-web` acts as the **Central Identity Authority (IdP)** for all Nazexa ecosystem applications (e.g., `nazexa-db`, `nazexa-socket-platform`).

- **Single Source of Truth**: All user credentials, password hashes, email verifications, and global session states reside exclusively in `nazexa-web`.
- **Decoupled Client Systems**: Satellite products (`nazexa-socket`, `nazexa-db`) do **not** store or manage central user passwords locally (`passwordHash: null`). Instead, they synchronize profile data against their local databases and issue product-specific sessions once validated by `nazexa-web`.
- **Single Sign-On (SSO)**: Users logged into `nazexa-web` possess a `nazexa_session` cookie (or top-level domain `.nazexa.com` in production) which allows downstream products to exchange this session for a verified user identity without prompting for credentials again.

---

## 2. Core Database Schema (`prisma/schema.prisma`)

### Model: `User` (Table: `users`)
- `id` (String, UUID, PK): Canonical central user ID (referenced as `centralUserId` by satellite products).
- `name` (String, nullable): User's full display name.
- `email` (String, unique): User's primary email address (lowercase).
- `emailVerified` (DateTime, nullable): Timestamp when the email was confirmed.
- `image` (String, LongText, nullable): Avatar URL.
- `password_hash` (String, nullable): Bcrypt hash of the user's password (rounds = 12).
- `status` (String, default `"active"`): Account status (`"active"`, `"disabled"`, `"suspended"`).
- `lastLoginAt` / `lastLoginIp`: Telemetry for security audit.

### Model: `Session` (Table: `sessions`)
- `id` (String, PK): Random session ID (26 alphanumeric chars).
- `userId` (String, FK -> `User.id`): References the authenticated user.
- `expiresAt` (DateTime): Expiration timestamp (default: 7 days).

### Model: `Application` (Table: `applications`)
- `id` (String, UUID, PK): Internal application ID.
- `clientId` (String, unique): Client application slug (e.g., `"nazexa-socket-platform"`, `"nazexa-db"`).
- `clientSecret` (String): Shared secret for authenticating machine-to-machine calls.
- `name` (String): Display name of the product.
- `status` (String, default `"active"`): Status of the application (`"active"` or `"disabled"`).
- `redirectUris` (String, Text): Comma-separated list of allowed SSO callback redirect URIs.
- `allowedOrigins` (String, Text): Comma-separated list of allowed CORS/WebSocket origins.

### Model: `Authorization` (Table: `authorizations`)
- Maps `(userId, applicationId)` pairs for OAuth 2.0 grants.

### Model: `UserEvent` (Table: `user_events`)
- Event bus table for broadcasting user lifecycle events (`USER_LOGGED_IN`, `USER_REGISTERED`, `USER_NAME_CHANGED`, etc.) to integrated clients.

---

## 3. Key Central Auth Endpoints

### 3.1 Direct Authentication
- `POST /api/auth/login`: Authenticates credentials (`{ email, password }`), updates telemetry, writes central `Session`, and sets `nazexa_session` cookie.
- `POST /api/auth/register`: Creates central user account and establishes `nazexa_session`.
- `POST /api/auth/logout`: Destroys session in `sessions` table and clears `nazexa_session` cookie.

### 3.2 OAuth 2.0 SSO & Token Exchange
- `POST /api/auth/oauth/token`:
  - Client sends `{ client_id, client_secret, grant_type: "session_exchange" }` with `Cookie: nazexa_session=<token>`.
  - Verifies client credentials against `applications` table and user session against `sessions` table.
  - Returns `{ access_token, token_type: "Bearer", expires_in: 3600, user_info: { id, email, name } }`.
- `GET /api/users/me`:
  - Accepts `Authorization: Bearer <access_token>` or `nazexa_session`.
  - Returns canonical profile: `{ id, name, email, emailVerified, image, status }`.

### 3.3 Machine-to-Machine & Verification Sync
- `POST /api/auth/internal/sync-verification`: Allows authenticated satellite client to mark a central user's email as verified.
- `POST /api/auth/internal/verify-status`: Retrieves verification status of a central user.
- `POST /api/auth/internal/send-verification`: Sends 6-digit verification code to user email.
- `POST /api/auth/internal/confirm-verification`: Confirms submitted 6-digit code against hashed code.

### 3.4 Federated Social OAuth Initiation
- `GET /api/auth/oauth/google/initiate?callback_url=<url>`
- `GET /api/auth/oauth/github/initiate?callback_url=<url>`
  - Passes client application callback through OAuth state. After provider consent, `nazexa-web` sets `nazexa_session` and redirects to the product's callback URL.

---

## 4. How Satellite Clients Integrate (The Standard Contract)

Every client application (e.g. `nazexa-socket-platform`, `nazexa-db`) follows this exact pattern:

1. **Environment Setup**:
   ```env
   NAZEXA_AUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_NAZEXA_AUTH_URL="http://localhost:3000"
   NAZEXA_CLIENT_ID="<registered-client-id>"
   NAZEXA_CLIENT_SECRET="<registered-client-secret>"
   ```
2. **User Identity Sync Model**:
   - Client local user model contains `centralUserId String? @unique` and `passwordHash String?`.
   - When a user logs in via central auth, client calls `findOrCreateLocalUser(centralUser)`:
     - Matches `centralUserId` or `email`.
     - Sets `passwordHash = null` so local password storage is decommissioned.
     - Syncs `name`, `emailVerified`, `status`.
3. **SSO Flow**:
   - Client middleware detects `nazexa_session` in incoming request cookies when no local product session is present.
   - Redirects browser to `/api/auth/sso?redirect=<destination>`.
   - `/api/auth/sso` executes `POST /api/auth/oauth/token` (`grant_type: session_exchange`) forwarding the `nazexa_session` cookie.
   - Queries `GET /api/users/me` using the returned Bearer token.
   - Syncs local user and issues local session cookie (`nzx_session_token` for Socket, `next-auth.session-token` for DB).
   - Redirects user to destination.

---

## 5. Ecosystem Registered Applications

| Client ID | Application Name | Default Redirect URI | Allowed Origin | Status |
| :--- | :--- | :--- | :--- | :--- |
| `nazexa-db` | Nazexa Database Platform | `http://localhost:8000/api/auth/sso` | `http://localhost:8000` | `active` |
| `nazexa-socket-platform` | Nazexa Socket Platform | `http://localhost:4000/api/auth/sso` | `http://localhost:4000` | `active` |

To register a new application, insert a row into `applications` via Prisma Studio (`npx prisma studio`) or database seed script.

---

## 6. Security Invariants for Agents

1. **Never modify password hashing outside `nazexa-web`**: Password management and authentication rules belong strictly to `nazexa-web`.
2. **Never break `grant_type === 'session_exchange'`**: Satellite products depend on the exact JSON body and cookie forwarding contract of `/api/auth/oauth/token`.
3. **Session Cookie Isolation**: Central cookie is named `nazexa_session`. Product cookies must use distinct names (`nzx_session_token` for Socket, `next-auth.session-token` for DB) to avoid namespace collisions.
4. **Preserve Database Cascade Rules**: Deleting a central user cascades to their sessions, accounts, authorizations, and verification codes.

