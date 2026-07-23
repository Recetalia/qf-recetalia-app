# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Angular 18.2 SPA with Angular SSR ([server.ts](server.ts), [src/main.server.ts](src/main.server.ts)) for the Recetalia pharmacy portal (dispensing electronic prescriptions). Uses **NgModule**-based architecture (no standalone components — see [angular.json](angular.json) schematic defaults `"standalone": false`) with lazy-loaded feature modules. TypeScript `strict` mode plus `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, and `strictTemplates` all enabled ([tsconfig.json](tsconfig.json)).

## Commands

| Task             | Command                                                   |
|------------------|-----------------------------------------------------------|
| Dev server       | `npm start` (wraps `ng serve`)                            |
| Build (prod+SSR) | `npm run build`                                           |
| Watch dev build  | `npm run watch`                                           |
| Unit tests       | `npm test` (Karma + Jasmine)                              |
| Serve SSR bundle | `npm run serve:ssr:farmacias-recetalia-app`               |
| Lint             | *Not configured* — no `lint` script, no ESLint/TSLint dep |
| Format           | *Not configured* — no Prettier dep                        |

Container build: [Dockerfile](Dockerfile) uses Nginx and [default.conf](default.conf).

## Architecture

### Routing

- Root routes in [src/app/app-routing.module.ts](src/app/app-routing.module.ts):
  - `''` → lazy `HomeModule`, guarded by `authGuard` with `data: { roles: ['ROLE_PHARMACY', 'ROLE_PHARMACY_ADMIN'] }`.
  - `register` → lazy `RegistergModule` *(typo in module symbol)*.
  - `login` → lazy `LoginModule`.
  - `**` → redirect to `login`.
- Home child routes in [src/app/pages/application/home/home-routing.module.ts](src/app/pages/application/home/home-routing.module.ts): `''` (`LandingRedirectComponent`, `pathMatch: 'full'` — redirige a `dashboard` o `prescriptions/search` según rol), `dashboard`, `prescriptions/search`, `prescriptions`, `dispensations`, `profile`.

### Backend Integration

Two backends, both read from [src/environments/environment.ts](src/environments/environment.ts):

| Env var                   | Purpose                                           |
|---------------------------|---------------------------------------------------|
| `apiUrl`                  | Main REST API (`recetalia-api-rest-dev/api`)      |
| `securityApiRecetaliaUrl` | Auth API (`security-api-recetalia/api/auth`)     |

Environment files:
- [src/environments/environment.ts](src/environments/environment.ts) — default (apunta a PROD `api.recetadigital.uy`). Usado por configs `production` y `development` (ninguna hace `fileReplacements`).
- [src/environments/environment.preprod.ts](src/environments/environment.preprod.ts) — apunta a `apipre.recetadigital.uy`. Usado por la config `preprod` (añadida 2026-04-22 para el deploy a pre-prod). El Dockerfile acepta `ARG CONFIGURATION=production` y pasa `--configuration=$CONFIGURATION` al `ng build`.

No existe `environment.prod.ts`: la config `production` de Angular no hace `fileReplacements`, usa `environment.ts` tal cual.

### API Patterns

- `HttpClient` used directly in each service (no shared wrapper). Every service repeats the same `map` + `catchError` shape.
- Response envelope [ApiResponse<T>](src/app/model/response/api-response.ts): `{ status: string; answer: T; applicationProvider?: string; metadata?: any; serverDateTime: string }`. Services check `status === 'SUCCESS'` and return `answer`.
- **Two incompatible pagination types coexist**:
  - [Page<T>](src/app/model/page.ts) — simple Spring Data shape (used by `DispensationService`).
  - [Pagination<T>](src/app/model/response/pagination-response.ts) — full Spring Data `Pageable` shape (used by `PrescriptionService`).
- Pagination params for Spring Data endpoints: `page`, `size`, optional `sort`.
- `AmpService`/`LaboratorioService` return a `Map`-shaped `answer`; services call `Object.values(response.answer)` to flatten.

### Interceptors & Guards

- [AuthInterceptor](src/app/interceptors/auth.interceptor.ts) registered both via `HTTP_INTERCEPTORS` multi-provider and `provideHttpClient(withInterceptorsFromDi())`; also adds `provideHttpClient(withFetch())`. Attaches `Authorization: Bearer <token>`; on `401` calls `authService.logout()`.
- [authGuard](src/app/interceptors/auth.guard.ts) (functional `CanActivateFn`): decodes JWT, fetches pharmacy by email, checks role against `route.data['roles']`, redirects to `/login` otherwise.

### Client-Side Password Encryption

Login ([src/app/pages/application/login/login.component.ts](src/app/pages/application/login/login.component.ts)) and registration ([src/app/pages/application/register/register.component.ts](src/app/pages/application/register/register.component.ts)) encrypt the password with **AES-ECB + PKCS7** using `crypto-js`. Key = `'ahjsdfhjbqer56243' + dynamicInfo`, padded/truncated to 32 bytes; `dynamicInfo` = first 10 chars of a generated UUID, sent in the request body alongside the ciphertext.

### State Management

- No NgRx / Signal Store. State is local to components.
- `AuthService` exposes a `BehaviorSubject<string | null>` wrapping the JWT ([src/app/services/auth.service.ts](src/app/services/auth.service.ts)).
- `localStorage` keys: `token`, `role` (browser-only, SSR guarded by `isPlatformBrowser`).

### UI Libraries

- **PrimeNG 17** + PrimeIcons + PrimeFlex
- **Angular Material 18** (used for `MatSnackBar`)
- **Bootstrap 5.3** + FontAwesome 6
- **Quill 2** (rich text)
- `angular-phone-number-input`, `intl-tel-input`, `libphonenumber-js`, `google-libphonenumber` (phone fields)
- `pdfmake` (lazy-loaded, browser-only), `xlsx`, `file-saver` for export

### Key Directories

| Path                                            | Purpose                                                   |
|-------------------------------------------------|-----------------------------------------------------------|
| [src/app/services](src/app/services)            | One service per backend resource (HttpClient callers)     |
| [src/app/model/request](src/app/model/request)  | Request DTO interfaces                                    |
| [src/app/model/response](src/app/model/response)| Response DTO interfaces                                   |
| [src/app/interceptors](src/app/interceptors)    | `AuthInterceptor`, `authGuard`                            |
| [src/app/pages/application](src/app/pages/application) | Feature modules: `login`, `register`, `home`       |
| [src/app/shared](src/app/shared)                | Pipes, validators, date utils; `SharedMRAModule`          |
| [src/app/components](src/app/components)        | Shared `header`, `footer` components                      |

### Conventions

- File naming: `kebab-case` for files, `PascalCase` for classes, `camelCase` for service methods.
- Services are `@Injectable({ providedIn: 'root' })` and build their URL as `${environment.apiUrl}/<resource>`.
- Error handling per-method: `map` unwraps `ApiResponse`, `catchError` logs and rethrows via `throwError(() => new Error(...))`.
- SSR-sensitive code guarded with `isPlatformBrowser(this.platformId)` (see `AuthService`, `DispensationFileService`).

## Observations

- No `environment.prod.ts`; la config `production` no tiene `fileReplacements` y usa `environment.ts`, que apunta a `api.recetadigital.uy/recetalia-api-rest-dev/...` (el entorno `-dev` de PROD). Pre-prod usa `environment.preprod.ts` vía la config `preprod`.
- `RegistergModule` symbol name and `RegisterComponent` typo — the module is imported that way in routing.
- Two duplicate pagination DTO shapes (`Page<T>` vs `Pagination<T>`) — unify before extending.
- `provideHttpClient` is called twice in [app.module.ts](src/app/app.module.ts) (with `withFetch()` and with `withInterceptorsFromDi()`) plus a legacy `HttpClientModule` import.
- `provideClientHydration()` is commented out; SSR is live but hydration is not.
- `DispensationFileService` contains a `debugger` statement in `recipeTypeColor` — strip before prod.
- AES-ECB with a hard-coded key baked into the JS bundle is not real encryption; any obfuscation value is minimal since the bundle ships to the browser.
- No lint/format tooling configured.

## Dashboard de KPIs y admin de cadena

Soporte para **admin de cadena** (`ROLE_PHARMACY_ADMIN`): dashboard de KPIs y vista consolidada de dispensaciones de todas las sucursales de la franquicia. Mergeado en `main`.

### Acceso por rol y resolución de franquicia

- [app-routing.module.ts](src/app/app-routing.module.ts): el `authGuard` de `''`/`HomeModule` admite `['ROLE_PHARMACY', 'ROLE_PHARMACY_ADMIN']`.
- [auth.service.ts](src/app/services/auth.service.ts) `getCurrentUser()`: si el rol es `ROLE_PHARMACY_ADMIN`, resuelve la franquicia vía `franchiseService.getByAdminEmail(token.mail)` (el admin se vincula por `adminEmail`, no es una farmacia individual) y devuelve `{ pharmacyId: '', franchiseId: f.id }`. Para `ROLE_PHARMACY` sigue usando `pharmacyService.getByEmail(...)`. El tipo de retorno incluye `franchiseId?`.
- [landing-redirect.component.ts](src/app/pages/application/home/landing-redirect/landing-redirect.component.ts): nuevo componente sin template montado en la ruta hija `''` (`pathMatch: 'full'`); redirige a `dashboard` si admin, si no a `prescriptions/search`.
- [sidebar.component](src/app/pages/application/home/components/sidebar/sidebar.component.ts): lee `userRole` vía `getCurrentUser()`; el link **Dashboard** se muestra solo para `ROLE_PHARMACY` o `ROLE_PHARMACY_ADMIN`.

### Dashboard (KPIs)

- [dashboard.component.ts](src/app/pages/application/home/dashboard/dashboard.component.ts) + [dashboard.service.ts](src/app/services/dashboard.service.ts): ruta hija `dashboard`. Llama `GET /dashboard/pharmacy-summary` con scope `{ pharmacyId }` o `{ franchiseId }` (según `isAdmin`) y `startDate`/`endDate` (presets `today`/`7d`/`30d`/`month`/`custom`). Charts PrimeNG (`ChartModule`): tendencia, top medicamentos, y por sucursal (`byBranch`). Modelo nuevo [pharmacy-summary-response.ts](src/app/model/response/pharmacy-summary-response.ts) (`PharmacySummaryResponse`, `TrendRow`, `MedicineCountRow`, `BranchCountRow`).

### Vista consolidada de dispensaciones

- [dispensation-list.component.ts](src/app/pages/application/home/dispensations/dispensation-list/dispensation-list.component.ts): flag `isAdmin` (de `getCurrentUser().role`). Si admin, carga las sucursales con `pharmacyService.getByFranchise(franchiseId)` y llena un dropdown de **Sucursal** (`branchOptions`, opción "Todas las sucursales" = `null`). En la búsqueda pasa `pharmacyId = selectedBranchId ?? ''` y `options.franchiseId` cuando es admin; si no, usa el `pharmacyId` propio sin `franchiseId`.
- [dispensation.service.ts](src/app/services/dispensation.service.ts) `search(...)`: nuevo parámetro opcional `franchiseId` añadido como query param.
- [pharmacy.service.ts](src/app/services/pharmacy.service.ts): `getByFranchise(franchiseId)` → `GET /pharmacies/by-franchise/{id}`.
- [franchise.service.ts](src/app/services/franchise.service.ts): `getByAdminEmail(email)` → `GET /franchises/by-admin-email/{email}`.
- [dispensation-search-row.ts](src/app/model/response/dispensation-search-row.ts): campos `dispensationProductName?`, `pharmacyName?` (contexto de cadena para la tabla consolidada).
