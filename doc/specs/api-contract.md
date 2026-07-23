# API Contract (Consumer View)

Endpoints the frontend calls, grouped by service file. All requests pass through [AuthInterceptor](../../src/app/interceptors/auth.interceptor.ts), which adds `Authorization: Bearer <token>` from `localStorage.token` when present and logs out on HTTP 401.

- **Base URLs** (from [environment.ts](../../src/environments/environment.ts)):
  - `API = environment.apiUrl` → `https://api.recetadigital.uy/recetalia-api-rest-dev/api`
  - `AUTH = environment.securityApiRecetaliaUrl` → `https://api.recetadigital.uy/security-api-recetalia/api/auth`
- All responses are wrapped in `ApiResponse<T>`; services unwrap `answer` when `status === 'SUCCESS'`.

---

## [AuthService](../../src/app/services/auth.service.ts)

All calls are **unauthenticated** (hit before login):

| HTTP | Path | Response | Notes |
|------|------|----------|-------|
| `POST` | `AUTH/login` | `AuthResponse` | Body: `{ email, password, info }`. `password` is AES-ECB ciphertext; `info` is the 10-char dynamic key suffix. Persists `token` and `role` in `localStorage`. |
| `POST` | `AUTH/request-reset` | `AuthResponse` | Body: `{ email, url }`. Triggers password reset email. |
| `POST` | `AUTH/reset-password` | `any` | Body: `{ token, newPassword }`. |

Also calls [PharmacyService.getByEmail](#pharmacyservice-srcappservicespharmacyservicets) when building `getCurrentUser()`.

---

## [PharmacyService](../../src/app/services/pharmacy.service.ts)

Base: `${API}/pharmacies`. Auth required (Bearer).

| HTTP | Path | Response |
|------|------|----------|
| `POST` | `/pharmacies` | `PharmacyResponse` (create) |
| `GET` | `/pharmacies` | `PharmacyResponse[]` |
| `GET` | `/pharmacies/{id}` | `PharmacyResponse` |
| `GET` | `/pharmacies/email/{email}` | `PharmacyResponse` (used by auth guard) |
| `PUT` | `/pharmacies/{id}` | `PharmacyResponse` |
| `DELETE` | `/pharmacies/{id}` | `void` |
| `GET` | `/pharmacies/by-franchise/{franchiseId}` | `PharmacyResponse[]` (sucursales de la cadena; usado por el admin) |
| `GET` | `/pharmacies/email-exists/{email}` | `boolean` |

---

## [PrescriptionService](../../src/app/services/prescription.service.ts)

Base: `${API}/prescriptions`.

| HTTP | Path | Response |
|------|------|----------|
| `GET` | `/prescriptions` | `PrescriptionResponse[]` |
| `GET` | `/prescriptions/{id}` | `PrescriptionResponse` |
| `POST` | `/prescriptions` | `PrescriptionResponse` |
| `PUT` | `/prescriptions/{id}` | `PrescriptionResponse` |
| `DELETE` | `/prescriptions/{id}` | `void` |
| `GET` | `/prescriptions/by-medical-provider-paginated?medicalProviderId&statuses&page&size` | `Pagination<PrescriptionResponse>` |
| `GET` | `/prescriptions/by-medic-and-medical-provider-paginated?medicId&medicalProviderId&statuses&page&size` | `Pagination<PrescriptionResponse>` |
| `GET` | `/prescriptions/by-patient-and-medical-provider-paginated?patientId&medicalProviderId&statuses&page&size` | `Pagination<PrescriptionResponse>` |
| `GET` | `/prescriptions/by-medical-provider-and-date-range?medicalProviderId&startDate&endDate&statuses&page&size` | `Pagination<PrescriptionResponse>` |
| `GET` | `/prescriptions/by-medic-and-date-range?medicId&startDate&endDate&statuses` | `PrescriptionResponse[]` |
| `GET` | `/prescriptions/download/excel?statuses[&medicId&patientId&startDate&endDate]` | `Blob` |
| `GET` | `/prescriptions/get-prescriptions-by-filters?statuses[&medicId&patientId&startDate&endDate&page&size]` | `Pagination<PrescriptionResponse>` |
| `GET` | `/prescriptions/by-code/{code}` | `PrescriptionResponse` |
| `GET` | `/prescriptions/search-available-Prescriptions-by-code?code` | `PrescriptionResponse[]` — devuelve **todas** las prescripciones del código, incluyendo las totalmente dispensadas. Las dispensadas incluyen `dispensedQty` (Integer, cajas) y `dispensedPresentation` (String, nombre del AMPP); null en las no dispensadas. La UI muestra "Dispensado: \<presentación\> — N cajas". Incluye `substanceName` (String nullable — principio activo derivado de DNMA); la UI lo muestra bajo el nombre del medicamento en Buscar Prescripción, en la sección PRESCRIPCIÓN del modal de dispensaciones, y en los exports Excel/PDF. |

`statuses` is passed as a single comma-joined string.

---

## [DispensationService](../../src/app/services/dispensation.service.ts)

Base: `${API}/dispensations`.

`POST /dispensations` y `PUT /dispensations/{id}` pueden devolver **400** `{ status: ERROR, answer: "La cantidad supera el máximo permitido por la posología: máximo N cajas" }` cuando `qty` supera el tope calculado por posología (solo si el tope es computable; si no, el API no valida). La UI clampea el input de Cantidad al tope antes de enviar y muestra la leyenda "Máximo N cajas (M unidades según posología)" usando [`dispensation-cap.util.ts`](../../src/app/shared/utils/dispensation-cap.util.ts).

| HTTP | Path | Response |
|------|------|----------|
| `POST` | `/dispensations` | `DispensationResponse` |
| `PUT` | `/dispensations/{id}` | `DispensationResponse` |
| `GET` | `/dispensations/{id}` | `DispensationResponse` |
| `GET` | `/dispensations/by-prescription/{prescriptionId}` | `DispensationResponse` |
| `GET` | `/dispensations/pharmacy/{pharmacyId}?page&size&sort` | `Page<DispensationResponse>` |
| `DELETE` | `/dispensations/{id}` | `void` (soft-delete) |
| `PATCH` | `/dispensations/{id}/cancel?cancelledByDispenserId` | `DispensationResponse` |
| `GET` | `/dispensations/search?pharmacyId[&franchiseId&dispensedById&laboratoryId&contains&condvtaId&startDate&endDate&page&size&sort]` | `Page<DispensationSearchRow>` — cada fila incluye `dispensationQty` (Integer, cajas dispensadas), mostrado en la columna y modal de la pantalla de Dispensaciones; y `prescriptionSubstanceName` (String nullable — principio activo derivado de DNMA), mostrado en la sección PRESCRIPCIÓN del modal de dispensaciones y en los exports Excel/PDF. |

`franchiseId` (opcional) habilita la vista consolidada de cadena: lo pasa el admin (`ROLE_PHARMACY_ADMIN`) junto con `pharmacyId = sucursal seleccionada ?? ''` para buscar en todas las sucursales de la franquicia.

`startDate`/`endDate` serialised as `YYYY-MM-DD` via [toLocalDateParam](../../src/app/shared/date-utils.ts).

---

## [PatientService](../../src/app/services/patient.service.ts)

Base: `${API}/patients`.

| HTTP | Path | Response |
|------|------|----------|
| `GET` | `/patients` | `PatientResponse[]` |
| `GET` | `/patients/{id}` | `PatientResponse` |
| `POST` | `/patients` | `PatientResponse` |
| `PUT` | `/patients/{id}` | `PatientResponse` |
| `DELETE` | `/patients/{id}` | `void` |
| `GET` | `/patients/by-provider?medicalProviderId` | `PatientResponse` (typed as single; endpoint name suggests list) |
| `GET` | `/patients/by-medic` | `PatientResponse[]` |
| `GET` | `/patients/search?[name&lastName&document]` | `PatientResponse[]` |
| `GET` | `/patients/document_number/{documentNumber}/document_type/{documentType}` | `PatientResponse` |

---

## [MedicsService](../../src/app/services/medics.service.ts)

Base: `${API}/medics`.

| HTTP | Path | Response |
|------|------|----------|
| `POST` | `/medics` | `MedicResponse` (rejects client-side if `especialityId == null`) |
| `GET` | `/medics` | `MedicResponse[]` |
| `GET` | `/medics/{id}` | `MedicResponse` |
| `GET` | `/medics/email-exists/{email}` | `boolean` |
| `GET` | `/medics/email/{email}` | `MedicResponse` |
| `PUT` | `/medics/{id}` | `MedicResponse` |
| `DELETE` | `/medics/{id}` | `void` |
| `GET` | `/medics/search?medicalProviderId&searchCriteria` | `MedicResponse[]` |

---

## [PharmacyDispensersService](../../src/app/services/pharmacy-dispensers.service.ts)

Base: `${API}/pharmacy-dispensers`.

| HTTP | Path | Response |
|------|------|----------|
| `GET` | `/pharmacy-dispensers` | `PharmacyDispenserResponse[]` |
| `GET` | `/pharmacy-dispensers/pharmacy` | `PharmacyDispenserResponse[]` (uses JWT pharmacy) |
| `POST` | `/pharmacy-dispensers` | `PharmacyDispenserResponse` (create) |
| `PUT` | `/pharmacy-dispensers/{id}` | `PharmacyDispenserResponse` |
| `GET` | `/pharmacy-dispensers/search?name&lastName&document` | `PharmacyDispenserResponse[]` |
| `POST` | `/pharmacy-dispensers/pharmacy` | `PharmacyDispenserResponse[]` (body = filter) |
| `GET` | `/pharmacy-dispensers/{id}` | `PharmacyDispenserResponse` |

---

## [AmpService](../../src/app/services/amp.service.ts)

Base: `${API}/amp/`.

| HTTP | Path | Response |
|------|------|----------|
| `GET` | `/amp/search?prodMspLike={q}` | `MedicineResponse[]` (server returns map; service flattens with `Object.values`) |

---

## [AmppService](../../src/app/services/ampp.service.ts)

Base: `${API}/ampp`.

| HTTP | Path | Response |
|------|------|----------|
| `GET` | `/ampp/search?prodMspLike={q}` | `AmppResponse[]` |
| `GET` | `/ampp/search/amp?ampId={id}` | `AmppResponse[]` — cada elemento incluye `cantidad` (string numérico nullable = unidades por envase). La pantalla de dispensación usa este campo para calcular el tope de cajas. |

---

## [FranchiseService](../../src/app/services/franchise.service.ts)

Base: `${API}/franchises`.

| HTTP | Path | Response |
|------|------|----------|
| `GET` | `/franchises` | `FranchiseResponse[]` |
| `GET` | `/franchises/by-admin-email/{email}` | `any` (franquicia del admin de cadena; usado por `AuthService.getCurrentUser()`) |

---

## [DashboardService](../../src/app/services/dashboard.service.ts)

Base: `${API}/dashboard`. Auth required (Bearer).

| HTTP | Path | Response |
|------|------|----------|
| `GET` | `/dashboard/pharmacy-summary?startDate&endDate[&pharmacyId\|&franchiseId]` | `PharmacySummaryResponse` |

`startDate`/`endDate` son obligatorios. El scope es mutuamente excluyente: `pharmacyId` para una farmacia individual (`ROLE_PHARMACY`) o `franchiseId` para una cadena completa (`ROLE_PHARMACY_ADMIN`); el servicio agrega como query param el que esté presente.

---

## [LaboratorioService](../../src/app/services/laboratorio.service.ts)

Base: `${API}/laboratorios`.

| HTTP | Path | Response |
|------|------|----------|
| `GET` | `/laboratorios` | `LaboratorioResponse[]` (server returns map; service flattens with `Object.values`) |

---

## [EspecialitiesService](../../src/app/services/especialities.service.ts)

Base: `${API}/especialities`.

| HTTP | Path | Response |
|------|------|----------|
| `GET` | `/especialities` | `Especialities[]` |

---

## [RegionService](../../src/app/services/region.service.ts)

Base: `${API}/regions`.

| HTTP | Path | Response |
|------|------|----------|
| `GET` | `/regions` | `RegionResponse[]` |

---

## [LocalityService](../../src/app/services/localities.service.ts)

Base: `${API}/localities`.

| HTTP | Path | Response |
|------|------|----------|
| `GET` | `/localities/region/{regionId}` | `LocalityResponse[]` |

---

## Observations

- `PatientService.getPatiensByMedicalProvider` is typed as `Observable<PatientResponse>` but endpoint name and usage suggest list.
- `PatientService.getPatiensByMedic` and `getPatiensByMedicalProvider` method names contain typos (`Patiens` → `Patients`).
- `PrescriptionService.getPrescriptionsByFilters` contains a commented-out hard-coded `http://localhost:8094` fallback URL — leftover debug code.
- `PrescriptionService.getByCodePrefix` uses a mixed-case path `search-available-Prescriptions-by-code`.
- `PharmacyDispensersService` exposes two `pharmacy` endpoints: `GET /pharmacy-dispensers/pharmacy` (no body) and `POST /pharmacy-dispensers/pharmacy` (body). Easy to confuse.
- No service cancels in-flight requests; none expose retry/backoff.
- Status filters are passed as comma-joined strings, not repeated `statuses=` params.
- `AmpService`/`LaboratorioService` responses are `Map<string, …>`; the frontend loses map keys by calling `Object.values`.
