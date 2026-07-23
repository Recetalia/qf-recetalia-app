# Data Model

Business entities (DTOs) consumed or produced by this Angular frontend. All interfaces live under [src/app/model](../../src/app/model). Field types reflect the TypeScript declarations; the backend is Spring-based, so dates are ISO strings and IDs are usually UUID strings.

## Envelope

[ApiResponse<T>](../../src/app/model/response/api-response.ts)

| Field                 | Type      |
|-----------------------|-----------|
| `status`              | `string` (`'SUCCESS'` / `'ERROR'`) |
| `answer`              | `T`       |
| `applicationProvider` | `string?` |
| `metadata`            | `any?`    |
| `serverDateTime`      | `string`  |

Also: `AnswerMap = { [key: string]: MedicineResponse }`, `AnswerMapLaboratorio = { [key: string]: LaboratorioResponse }`.

## Pagination

Two shapes in use:

- [Page<T>](../../src/app/model/page.ts) — `content`, `totalElements`, `totalPages`, `size`, `number`, `first`, `last`, `numberOfElements`, `empty`.
- [Pagination<T>](../../src/app/model/response/pagination-response.ts) — adds `pageable` (`pageNumber`, `pageSize`, `sort`, `offset`, `paged`, `unpaged`) and top-level `sort`.

---

## Prescriptions

### [PrescriptionResponse](../../src/app/model/response/prescription-response.ts)

| Field | Type |
|-------|------|
| `id` | `string` |
| `expireAt` | `string` |
| `medicId`, `medicCjp`, `medicName`, `medicLastname` | `string` |
| `patientId`, `patientName`, `patientLastname` | `string` |
| `patientDocument` | `Document \| null` |
| `code`, `status` | `string` |
| `dose`, `frecuency`, `duration` | `number` |
| `doseUnit`, `frecuencyUnit`, `durationUnit` | `string` |
| `medicalHistory`, `affections` | `string \| null` |
| `productType`, `productId`, `doseType` | `string` |
| `createdAt`, `updatedAt`, `deletedAt` | `string \| null` |
| `link`, `medicLink`, `patientLink` | `string` |
| `ampDsc`, `vmpDsc`, `prodMsp` | `string` |
| `nombreLaboratory`, `rutLaboratory` | `string` |
| `pharmacyId`, `pharmacyName` | `string` |
| `cronicCode?`, `dateTimeToSend?` | `string?` |
| `isSent?`, `isCronic?` | `boolean?` |
| `medicalProviderId?`, `medicalProviderName?` | `string?` |
| `condvtaId?` | `number?` (11 = green, 12 = orange, else white) |

### Document (embedded)

`{ number: string; type: string }`

### [PrescriptionRequest](../../src/app/model/request/prescription-request.ts)

Required: `medicId`, `patientId`, `code`, `status`, `productType`, `productId`, `productName`.
Optional: `expireAt`, `dose`, `doseUnit`, `frecuency`, `frecuencyUnit`, `medicalHistory`, `affections`, `duration`, `durationUnit`, `doseType`, `isCronic`, `dateTimeToSend`, `dosificationType`.

---

## Patients

### [PatientResponse](../../src/app/model/response/patient-response.ts)

| Field | Type |
|-------|------|
| `id`, `name`, `lastname` | `string` |
| `email?` | `string?` |
| `phone` | `Phone` (see below) |
| `document` | `Document` |
| `addressCountryId?`, `addressLocalityId?`, `addressStreet?`, `addressNumber?`, `addressComments?` | `string?` |
| `user`, `password` | `string` |
| `birthdate`, `createdAt`, `updatedAt` | `string` |
| `deletedAt?` | `string?` |
| `sex?`, `avatarId?` | `string?` |
| `displayLabel?` | `string?` (client-side) |

### [PatientRequest](../../src/app/model/request/patient-request.ts)

Same shape as response minus timestamps plus `documentType: string`.

### Phone (embedded in patient/medic/pharmacy)

`{ countryCode: string; national: string; international: string; type: string; validated: boolean }`

---

## Medics

### [MedicResponse](../../src/app/model/response/medic-response.ts)

| Field | Type |
|-------|------|
| `id`, `name`, `lastname` | `string` |
| `gender?` | `string?` |
| `email`, `cjp`, `status` | `string` |
| `phone` | `Phone` |
| `document` | `Document` |
| `birthdate` | `string` |
| `addressCountryId?`, `addressLocalityId?`, `addressStreet?`, `addressNumber?`, `addressComments?` | `string?` |
| `createdAt`, `updatedAt` | `string` |
| `deletedAt` | `any` |
| `especialityId`, `especialityName`, `medicalProviderName` | `string` |
| `medicalProviderId` | `any` |

### [MedicRequest](../../src/app/model/request/medic-request.ts)

Adds `password: string`, `info: string` (see auth encryption pattern), `medicalProviderId?`, `especialityId?`.

---

## Pharmacies

### [PharmacyResponse](../../src/app/model/response/pharmacy-response.ts)

| Field | Type |
|-------|------|
| `id`, `name`, `businessName`, `rut`, `email` | `string` |
| `phone` | `Phone` |
| `status` | `string` |
| `managerName`, `managerLastname`, `managerCJP` | `string` |
| `managerDocument` | `Document` |
| `createdAt`, `updatedAt` | `string` |
| `addressCountryId?`, `addressLocalityId?`, `addressStreet?`, `addressNumber?`, `addressComments?`, `franchiseId?` | `string?` |

### [PharmacyRequest](../../src/app/model/request/pharmacy-request.ts)

Adds `password: string`, `info: string`; `businessName`/`rut` nullable; `camera?`, `logoId?`, `passwordForgotCode?` optional.

---

## Pharmacy Dispensers

### [PharmacyDispenserResponse](../../src/app/model/response/pharmacy-dispenser-response.ts)

| Field | Type |
|-------|------|
| `id`, `name`, `lastname` | `string` |
| `document` | `Document` |
| `createdAt` | `string` |
| `updatedAt` | `string \| null` |
| `pharmacy` | `PharmacyResponse` |
| `displayLabel` | `String` (boxed type — note in Observations) |

### [PharmacyDispenserRequest](../../src/app/model/request/pharmacy-dispenser-request.ts)

`name`, `lastname`, `document`, `pharmacyId: string \| undefined`.

---

## Dispensations

### [DispensationResponse](../../src/app/model/response/dispensation-response.ts)

| Field | Type |
|-------|------|
| `id`, `qty`, `status`, `substitute`, `loteNumber` | varies |
| `createdAt`, `updatedAt` | `string` |
| `deletedAt?` | `string \| null` |
| `loteExpireAt?` | `string \| null` |
| `dispensedToName`, `dispensedToLastname` | `string` |
| `dispensedToDocument` | `{ number; type }` |
| `dispensedToAddressCity?`, `dispensedToAddressStreet?`, `dispensedToAddressCountryId?`, `dispensedToAddressCountryName?` | `string \| null` |
| `prescriptionId`, `pharmacyId` | `string` |
| `pharmacyName?` | `string \| null` |
| `dispensedById` | `string` |
| `dispensedByName?`, `dispensedCancelledById?`, `dispensedCancelledByName?` | `string \| null` |
| `productId`, `productType` | `string` |

### [DispensationRequest](../../src/app/model/request/dispensation-request.ts)

Required: `prescriptionId`, `loteNumber`, `dispensedToName`, `dispensedToLastname`, `dispensedToDocument`, `productId`, `productType` (`'AMP' | 'VMP'`).
Optional: `qty` (default 1), `pharmacyId`, `status` (`'DISPENSED' | 'CANCELLED' | 'AVAILABLE'`), `substitute` (`'Y' | 'N'`), `loteExpireAt`, address fields, `dispensedById`, `dispensedCancelledById`, `dnmaLaboratoryId`, `condvtaId`.

### [DispensationSearchRow](../../src/app/model/response/dispensation-search-row.ts)

Flat denormalised row returned by `/dispensations/search`. Groups of fields:

- Prescription: `prescriptionId`, `prescriptionCode`, `prescriptionStatus`, `prescriptionDoseUnit`, `prescriptionFrecuency`, `prescriptionFrecuencyUnit`, `prescriptionDoseType`, `prescriptionIsCronic`, `prescriptionDose`, `prescriptionDuration`, `prescriptionDurationUnit`.
- Patient: `patientId`, `patientName`, `patientLastName`, `patientDocument` (`DocumentLike`).
- Dispensation: `dispensationId`, `dispensationStatus`, `dispensationQty`, `dispensationCreatedAt`, `dispensationUpdatedAt`, `dispensationProductId`, `dispensationProductName?`, `dispensationSubstitute`.
- Dispenser: `pharmacyDispenserId`, `pharmacyDispenserName`, `pharmacyDispenserLastName`, `pharmacyDispenserDocument`.
- Medic: `medicId`, `medicName`, `medicLastname`, `medicEmail`, `medicDocument`, `medicCJP`.
- Meta: `dnmaLaboratoryId: number \| null`, `condvtaId?: number`.

`DocumentLike = { number; type } | string | null`.

---

## Franchises

### [FranchiseResponse](../../src/app/model/response/franchise-response.ts)

| Field | Type |
|-------|------|
| `id`, `name` | `string` |
| `createdAt`, `updatedAt` | `string` |
| `logo` | `FileResponse` |

### FileResponse (same file)

`id`, `filename`, `url`, `urlThumb`, `type`, `extension`, `createdAt`, `updatedAt` — all `string`.

---

## Dashboard

KPIs returned by `GET /dashboard/pharmacy-summary` (see [DashboardService](#dashboardservice-srcappservicesdashboardservicets) in the API contract). All interfaces live in [pharmacy-summary-response.ts](../../src/app/model/response/pharmacy-summary-response.ts).

### [PharmacySummaryResponse](../../src/app/model/response/pharmacy-summary-response.ts)

| Field | Type |
|-------|------|
| `dispensations` | `number` (total en el rango) |
| `previousDispensations` | `number` (rango anterior, para comparar) |
| `trend` | `TrendRow[]` |
| `topMedicines` | `MedicineCountRow[]` |
| `byBranch` | `BranchCountRow[]` (por sucursal; sólo poblado en scope de cadena) |

### TrendRow (same file)

`{ date: string; prescriptions: number; dispensations: number }`

### MedicineCountRow (same file)

`{ medicineId: string; medicineName: string; count: number }`

### BranchCountRow (same file)

`{ pharmacyId: string; pharmacyName: string; count: number }`

---

## Medicines / AMP / AMPP / Laboratorios

### [MedicineResponse](../../src/app/model/response/medicine-response.ts) (AMP/VMP)

| Field | Type |
|-------|------|
| `id`, `name` | `string` |
| `unit`, `unidadDsc` | `string \| null` |
| `substanceName` | `string` |
| `labName` | `string \| null` (null for VMP) |
| `dosificationUnit` | `string` |
| `permission` | `string[]` (e.g. `['ROLE_MEDIC']`) |
| `productType` | `'AMP' \| 'VMP'` |
| `dosif` | `string` |
| `dosificationType` | `'VOLUME' \| 'QUANTITY'` |
| `prodMsp` | `string \| null` |
| `condvtaId` | `number \| null` |

### [AmppResponse](../../src/app/model/response/ampp-response.ts)

`id`, `descripcion`, `estado`, `comercializado`, `descripciones` (JSON string, not parsed), `estadoValidacion`, `ampId`, `vmppId`, `dnmaLaboratoryId: number`, `laboratorioId: number`, `condvtaId: string`.

### [LaboratorioResponse](../../src/app/model/response/laboratorio-response.ts)

All fields `string | null`: `id`, `nombre`, `nombreAbr`, `rut`, `estadoVal`, `observacion`, `url`, `estado`.

---

## Reference Data

### [RegionResponse](../../src/app/model/response/region-response.ts)

`id`, `name`, `slug`, `lat`, `lng`, `createdAt`, `updatedAt`.

### [LocalityResponse](../../src/app/model/response/locality-response.ts)

`id`, `regionId`, `name`, `slug`, `lat`, `lng`.

### [Especialities](../../src/app/model/response/especialities-response.ts)

`id`, `name`, `slug`, `tags`, `description?`, `createdAt`, `updatedAt`.

### [MedicalProviderResponse](../../src/app/model/response/medical-provider-response.ts) / [MedicalProviderRequest](../../src/app/model/request/medical-provider-request.ts)

Provider entities (clinics/institutions); includes `medicalProviderTypeId`, `businessName`, `rut`, `status`, `logoId?`, `passwordForgotCode?`.

---

## Auth

### [AuthResponse](../../src/app/model/response/Auth-response.ts)

`ApiResponse`-shaped envelope where `answer: Answer`:

- `Answer = { token: string; refreshToken: any; username: string; role: string }`

JWT claims read client-side (via `jwt-decode`): `mail`, `role`.

## Observations

- `PatientResponse.password` is declared — sensitive data should not be sent to the browser; verify the backend omits it.
- Two pagination DTO shapes co-exist ([Page](../../src/app/model/page.ts) vs [Pagination](../../src/app/model/response/pagination-response.ts)); choose one.
- `MedicResponse.medicalProviderId` and `MedicResponse.deletedAt` typed as `any`.
- `PharmacyDispenserResponse.displayLabel` uses the boxed `String` type rather than `string`.
- `AmppResponse.descripciones` is a JSON string — consumers must `JSON.parse` manually.
- `AmppResponse.condvtaId` is `string`, but `PrescriptionResponse.condvtaId` is `number`, and `DispensationRequest.condvtaId` is `string | null`. Inconsistent across DTOs.
- `Auth-response.ts` filename uses capital `A` (unlike the rest of the folder which is lowercase kebab-case).
- `Especialities` (plural) is used as a singular entity name.
- `LaboratorioResponse.id` is `string | null` but `AmppResponse.laboratorioId` is `number` — two different IDs.
