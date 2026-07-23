# Authentication & Authorisation

## Token Storage

Storage is **`localStorage`** only (no cookies, no `sessionStorage`); access is guarded with `isPlatformBrowser` because of SSR.

| Key     | Written by                                                           | Read by                                 |
|---------|----------------------------------------------------------------------|-----------------------------------------|
| `token` | [AuthService.setToken](../../src/app/services/auth.service.ts)       | `AuthService.getToken`, `AuthInterceptor` |
| `role`  | [AuthService.setRole](../../src/app/services/auth.service.ts)        | `AuthService.getRole`                   |

- [AuthService](../../src/app/services/auth.service.ts) exposes `token$ = BehaviorSubject<string | null>`, seeded from `localStorage.getItem('token')`.
- `clearToken()` removes both keys and emits `null`.
- `LoginComponent` constructor also wipes `token` and `role` from `localStorage` whenever it mounts ([login.component.ts](../../src/app/pages/application/login/login.component.ts)).

## JWT Handling

- JWT decoded with [`jwt-decode`](https://www.npmjs.com/package/jwt-decode) (named `jwtDecode` import).
- Claims consumed:
  - `mail` — used as username and to look up the pharmacy (`PharmacyService.getByEmail`) or, for chain admins, the franchise (`FranchiseService.getByAdminEmail`).
  - `role` — compared against route `data.roles`, and used by `getCurrentUser()` to branch the lookup (`ROLE_PHARMACY_ADMIN` vs `ROLE_PHARMACY`).
- No client-side signature verification and no expiry handling; the server’s 401 is the only expiry signal.

## Interceptor — [AuthInterceptor](../../src/app/interceptors/auth.interceptor.ts)

- Registered two ways in [app.module.ts](../../src/app/app.module.ts): as `HTTP_INTERCEPTORS` multi-provider and via `provideHttpClient(withInterceptorsFromDi())`.
- Behaviour:
  1. If `AuthService.getToken()` returns a non-empty string, clones the request with header `Authorization: Bearer <token>`.
  2. Forwards to next handler.
  3. On any `HttpErrorResponse` with `status === 401`, calls `AuthService.logout()` (clears storage, navigates to `/login`); then re-throws the error.
- No refresh-token logic; `AuthResponse.answer.refreshToken: any` is received but never used.

## Route Guard — [authGuard](../../src/app/interceptors/auth.guard.ts)

Functional `CanActivateFn`:

1. Calls `authService.getCurrentUser()` which:
   - Reads the token,
   - Decodes it,
   - **Branches by role**:
     - `ROLE_PHARMACY_ADMIN` → `FranchiseService.getByAdminEmail(decodedToken.mail)`, returns `{ email, role, status: 'ACTIVE', pharmacyId: '', franchiseId: f?.id }` (the admin is bound by `adminEmail`, not a single pharmacy).
     - any other role → `PharmacyService.getByEmail(decodedToken.mail)`, returns `{ email, role, status, pharmacyId, franchiseId }`.
2. Allows access if `user` is truthy **and** `roles.includes(user.role)` (where `roles` is `route.data['roles']`).
3. Logs a warning if `user.status === 'INACTIVE'` but **does not block** (the redirect is commented out).
4. On failure or error, redirects to `/login` and denies.

### Routes using the guard

Only the root `''` route is guarded ([app-routing.module.ts](../../src/app/app-routing.module.ts)):

```
{ path: '', loadChildren: () => HomeModule, canActivate: [authGuard], data: { roles: ['ROLE_PHARMACY', 'ROLE_PHARMACY_ADMIN'] } }
```

Child routes under `HomeModule` inherit the parent guard.

## Roles Referenced in Code

| Role                  | Where                                                                          |
|-----------------------|--------------------------------------------------------------------------------|
| `ROLE_PHARMACY`       | `app-routing.module.ts` — single-pharmacy user; resolves identity via `PharmacyService.getByEmail` |
| `ROLE_PHARMACY_ADMIN` | `app-routing.module.ts` (admitted into the app shell) and `auth.service.ts` — chain admin; resolves franchise via `FranchiseService.getByAdminEmail`. `LandingRedirectComponent` and `SidebarComponent` branch on this role (redirect to `dashboard`, show Dashboard link). |
| `ROLE_MEDIC`          | Appears in [MedicineResponse.permission](../../src/app/model/response/medicine-response.ts) docstring (returned by backend; not enforced client-side here) |

No other roles are referenced in this frontend.

## Login Flow

1. User submits [LoginComponent](../../src/app/pages/application/login/login.component.ts):
   - Generates **`dynamicInfo`** = first 10 chars of a random UUIDv4.
   - Builds a 32-byte AES key = `padOrTruncate('ahjsdfhjbqer56243' + dynamicInfo, 32)`.
   - Encrypts the password with **AES / ECB / PKCS7** using `crypto-js`, returning Base64 ciphertext.
2. `AuthService.login(email, encryptedPassword, dynamicInfo)` POSTs to `AUTH/login`:
   - Body: `{ email, password: <ciphertext>, info: <dynamicInfo> }`.
3. On `AuthResponse`, saves `answer.token` and `answer.role` to `localStorage` and emits on `token$`.
4. Component navigates to `'/'`; `authGuard` then runs and verifies the role.

### Registration

[RegisterComponent](../../src/app/pages/application/register/register.component.ts) performs the **same AES-ECB encryption** on the pharmacy password (same hard-coded common key), and passes `info: dynamicInfo` as part of `PharmacyRequest`. The backend presumably decrypts with `commonKey + info`.

### Password Reset

Two endpoints, both via [AuthService](../../src/app/services/auth.service.ts):

- `POST /auth/request-reset` with `{ email, url: window.location.href }`.
- `POST /auth/reset-password` with `{ token, newPassword }` — the `token` here is a reset token supplied by the server, **not** a JWT, and `newPassword` is sent in plaintext (no AES).

## Observations

- **AES-ECB** is not secure (leaks plaintext patterns) and the "common key" (`'ahjsdfhjbqer56243'`) is hard-coded in the browser bundle. Treat this as obfuscation, not encryption; the real trust boundary is HTTPS.
- `reset-password` sends the new password **unencrypted**, inconsistent with login/register.
- `AuthResponse.answer.refreshToken` is declared `any` and never consumed — no refresh flow.
- `authGuard` detects `INACTIVE` users but the blocking branch is commented out, so inactive users currently pass.
- JWT expiry is not checked client-side; expired tokens only fail on the next 401.
- `AuthService.getCurrentUser()` does a network round-trip (`PharmacyService.getByEmail`) on every guard activation — no caching.
- `LoginComponent.encryptPassword` logs the derived key to the console (`console.log(finalKey)`); strip before prod.
- Role strings are compared case-sensitively; any drift between backend and `ROLE_PHARMACY` literal silently denies access.
