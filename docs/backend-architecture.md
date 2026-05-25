# Backend Architecture — Tenancy Portal (Assam)

Laravel API (`backend/`) with React frontend. This document maps **API flows**, **role-based access**, **application workflows**, and **database relationships**.

---

## 1. System overview

```mermaid
flowchart TB
    subgraph CLIENT["Frontend (React)"]
        UI[Landing / Dashboard / Forms]
    end

    subgraph API["Laravel Backend — API Layer"]
        ROUTES["routes/api.php"]
        MW_AUTH["Middleware: auth:sanctum"]
        MW_ROLE["Middleware: role"]
        CTRL["Controllers"]
        SVC["Services e.g. DashboardStatsService"]
        RES["Resources e.g. ApplicationResource"]
    end

    subgraph PERSIST["Persistence"]
        DB[(MySQL Database)]
        FS["Storage — uploads/PDFs/photos"]
        SESS["Session + Sanctum tokens"]
    end

    UI -->|HTTP JSON| ROUTES
    ROUTES --> MW_AUTH --> MW_ROLE --> CTRL
    CTRL --> SVC
    CTRL --> RES
    CTRL --> DB
    CTRL --> FS
    MW_AUTH --> SESS
```

**Keywords:** `Sanctum`, `session cookie`, `role-based access`, `REST API`, `Eloquent ORM`

---

## 2. Request pipeline (every protected call)

```mermaid
flowchart LR
    REQ[HTTP Request] --> PUBLIC{Public route?}
    PUBLIC -->|Yes| PUB_CTRL["AuthController / public/*"]
    PUBLIC -->|No| SANCTUM["auth:sanctum"]
    SANCTUM --> USER{Authenticated user?}
    USER -->|No| E401[401 Unauthorized]
    USER -->|Yes| ROLE{"role middleware"}
    ROLE -->|Fail| E403[403 Forbidden]
    ROLE -->|Pass| HANDLER[Controller action]
    HANDLER --> MODEL[Eloquent Model]
    MODEL --> DB[(MySQL)]
    HANDLER --> JSON[JSON Response]
```

### Role groups (`app/Constants/Roles.php`)

| Keyword | Roles |
|--------|--------|
| `citizen` | `user` |
| `assistant` | `ra_assistant`, `rc_assistant`, `rt_assistant` |
| `principal` | `rent_authority`, `rent_court`, `rent_tribunal` |
| `admin` | `super_admin`, `district_admin` |
| `management` | admins + principals |
| `allStaff` | assistants + principals |
| `allAdminStaff` | admins + all staff |

Middleware: `app/Http/Middleware/EnsureRole.php` (registered as `role` in `Kernel.php`).

---

## 3. Authentication & profile flow

```mermaid
sequenceDiagram
    participant C as Citizen UI
    participant A as AuthController
    participant U as users table
    participant L as user_activity_logs

    C->>A: POST /api/register
    A->>U: INSERT role=user, district_id
    A-->>C: user + otp_required

    C->>A: POST /api/login (phone + OTP/password)
    A->>U: SELECT by phone
    alt blocked / pending approval
        A-->>C: 403
    else OK
        A->>L: INSERT action=login
        A-->>C: session + user JSON
    end

    C->>A: GET /api/user (auth:sanctum)
    A-->>C: current user

    C->>A: POST /api/logout
    A->>L: INSERT action=logout
```

### Public routes (no auth)

| Method | Path | Controller |
|--------|------|------------|
| POST | `/api/register` | `AuthController@register` |
| POST | `/api/login` | `AuthController@login` |
| GET | `/api/public/states` | `StateController@publicIndex` |
| GET | `/api/public/districts` | `DistrictController@publicIndex` |
| GET | `/api/public/offices` | `OfficeController@publicIndex` |
| GET | `/api/public/village-wards` | `VillageWardController@publicIndex` |
| GET | `/api/tenancy-applications/{id}/receipt` | `TenancyApplicationController@receipt` |
| GET | `/api/tenancy-applications/{id}/application-details` | `TenancyApplicationController@applicationDetails` |

### Authenticated profile

| Method | Path | Role | Controller |
|--------|------|------|------------|
| GET | `/api/profile` | `user` | `ProfileController@show` |
| PUT | `/api/profile` | `user` | `ProfileController@update` |
| GET | `/api/user` | any | `AuthController@user` |
| POST | `/api/logout` | any | `AuthController@logout` |

**Keywords:** `phone`, `OTP` (prototype: `123456`), `is_blocked`, `approved_at`, session guard `web`

---

## 4. UIN / Tenancy certificate flow

Separate from Assam Tenancy Act **service forms**. Handled by `TenancyApplicationController`.

```mermaid
flowchart TB
    subgraph CITIZEN["Citizen — role: user"]
        D1[POST draft] --> D2[PUT draft wizard steps]
        D2 --> D3[POST submit]
        J1[POST join via ref_code]
    end

    subgraph API_UIN["TenancyApplicationController"]
        TC[tenancy_applications]
    end

    subgraph ADMIN_UIN["Admin — super_admin / district_admin"]
        LIST[GET /admin/tenancy-records]
    end

    D1 & D2 & D3 & J1 --> TC
    LIST --> TC

    TC --> STATUS_UIN["status: DRAFT → PARTIAL → SUBMITTED → … → COMPLETED"]
    TC --> UID_FIELD["uid — UIN issued"]
```

### Key routes

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/tenancy-applications/my` | Citizen's applications |
| GET | `/api/tenancy-applications/draft/current` | Current draft |
| POST | `/api/tenancy-applications/draft` | Create draft |
| PUT/POST | `/api/tenancy-applications/{id}/draft` | Update wizard |
| POST | `/api/tenancy-applications/{id}/submit` | Submit |
| POST | `/api/tenancy-applications/join` | Second party join |
| GET | `/api/tenancy-applications/{id}/acknowledgement` | PDF acknowledgement |
| GET | `/api/admin/tenancy-records` | Admin list (UIN only) |

### Tenancy table keywords (`tenancy_applications`)

- `application_no`, `ref_code`, `status`, `uid`
- `user_id`, `district_id`, `office_id`, `village_ward_id`
- `initiator_role`, `initiator_completed`, `second_party_completed`
- `landlord_user_id`, `tenant_user_id`
- `wizard_step`, `movement_history`, `current_with`
- Workflow: `forwarded_at`, `forwarded_by_user_id`, `approved_at`, `approved_by_user_id`, `assigned_to_role`
- Files: `agreement_pdf_path`, photo/signature paths, PAN/Aadhaar paths

**Form type constant:** `ApplicationTypes::TENANCY_CERTIFICATE` → `'tenancy'`

---

## 5. Service application workflow

Rent Authority / Rent Court / Rent Tribunal forms. Handled by per-form controllers + `ApplicationWorkflowController`.

```mermaid
flowchart TB
    subgraph SUBMIT["1. Submit — citizen"]
        S1["POST /rent-*-applications etc."]
        S2["status = SUBMITTED"]
        S3["assigned_to_role = assistant"]
    end

    subgraph ASSIST["2. Assistant inbox"]
        I1["GET /admin/applications/inbox"]
        F1["POST …/forward"]
        F2["status = IN_REVIEW"]
        F3["assigned_to_role = rent_authority | rent_court | rent_tribunal"]
    end

    subgraph PRINCIPAL["3. Principal inbox"]
        P1["GET /admin/applications/principal-inbox"]
        A1["POST …/approve"]
        A2["status = COMPLETED"]
        R1["POST …/reject → REJECTED"]
    end

    subgraph ADMIN_VIEW["4. Admin lists"]
        ALL["GET /admin/applications/all — service forms only"]
        SHOW["GET /admin/applications/{applicationNo}"]
    end

    S1 --> S2 --> S3
    S3 --> I1 --> F1 --> F2 --> F3
    F3 --> P1 --> A1 --> A2
    P1 --> R1
    ALL --> SHOW
```

### Assistant → principal routing

```mermaid
flowchart LR
    RA_A[ra_assistant] -->|forward| RA_P[rent_authority]
    RC_A[rc_assistant] -->|forward| RC_P[rent_court]
    RT_A[rt_assistant] -->|forward| RT_P[rent_tribunal]
```

### Workflow API (`ApplicationWorkflowController`)

| Method | Path | Who |
|--------|------|-----|
| GET | `/api/admin/applications/inbox` | assistants |
| GET | `/api/admin/applications/principal-inbox` | principals |
| GET | `/api/admin/applications/all` | super_admin, district_admin (no UIN) |
| GET | `/api/admin/applications/{applicationNo}` | staff + admin |
| GET | `/api/admin/applications/{type}/{id}` | staff + admin |
| POST | `/api/admin/applications/{type}/{id}/forward` | assistants |
| POST | `/api/admin/applications/{type}/{id}/reject` | staff |
| POST | `/api/admin/applications/{type}/{id}/approve` | principals |

**Keywords:** `district_id` scoping, `ApplicationResource`, `form_type` discriminator

---

## 6. Form type → database table mapping

From `app/Constants/ApplicationTypes.php`:

| Keyword | `form_type` | DB table | Default assistant |
|---------|-------------|----------|-------------------|
| UIN | `tenancy` | `tenancy_applications` | — |
| Form I | `form-i-rent-revision` | `rent_revision_applications` | `ra_assistant` |
| Form IA | `form-i-a-other-charges-revision` | `other_charges_revision_applications` | `ra_assistant` |
| Form IB | `form-i-b-valuer-appointment` | `valuer_appointment_applications` | `ra_assistant` |
| Form II | `form-ii-rent-court-possession` | `rent_court_possession_applications` | `rc_assistant` |
| Form III | `form-iii-rent-court-filing` | `rent_court_filing_applications` | `rc_assistant` |
| Form IV | `form-iv-rent-authority-filing` | `rent_authority_filing_applications` | `ra_assistant` |
| Form V | `form-v-rent-court-appeal` | `rent_court_appeal_applications` | `rc_assistant` |
| Form VI | `form-vi-rent-tribunal-appeal` | `rent_tribunal_appeal_applications` | `rt_assistant` |

`ApplicationTypes::serviceForms()` = all types **except** `tenancy` (used for Service applications admin list).

### Citizen submit routes (`role:user`)

- `POST /api/rent-revision-applications`
- `POST /api/other-charges-revision-applications`
- `POST /api/valuer-appointment-applications`
- `POST /api/rent-court-possession-applications`
- `POST /api/rent-court-filing-applications`
- `POST /api/rent-authority-filing-applications`
- `POST /api/rent-court-appeal-applications`
- `POST /api/rent-tribunal-appeal-applications`

Each has matching `GET /api/{resource}/{id}` for the owner.

### Unified citizen list

`GET /api/tenant-forms/my` → `TenantFormsStatusController` (aggregates tenancy + all service forms for dashboard).

---

## 7. Status state machine (service applications)

From `app/Constants/Status.php`:

```mermaid
stateDiagram-v2
    [*] --> SUBMITTED: citizen POST store
    SUBMITTED --> IN_REVIEW: assistant forward
    SUBMITTED --> REJECTED: assistant reject
    IN_REVIEW --> COMPLETED: principal approve
    IN_REVIEW --> REJECTED: principal reject
    COMPLETED --> [*]
    REJECTED --> [*]
```

**Tenancy (UIN)** also uses: `DRAFT`, `PARTIAL`, `PENDING`, `UNDER_PROCESS`, `APPROVED`, etc. — primarily in `TenancyApplicationController`.

---

## 8. Admin & dashboard API map

```mermaid
flowchart TB
    subgraph SUPER["super_admin"]
        DS[dashboard-stats]
        AL[activity-logs]
        CRUD[districts / offices / designations / roles]
        TA[tenancy-records]
        SA[applications/all]
    end

    subgraph DIST["district_admin"]
        TA2[tenancy-records scoped]
        SA2[applications/all scoped]
        ST[staff-dashboard-stats]
    end

    subgraph STAFF["assistants + principals + district_admin"]
        IN[inbox / principal-inbox]
        WF[forward / reject / approve]
        ST2[staff-dashboard-stats]
    end

    subgraph MGMT["management roles"]
        UM[users CRUD]
    end

    DS --> DashboardController
    ST & ST2 --> DashboardController
    IN & WF --> ApplicationWorkflowController
    UM --> UserManagementController
```

| Method | Path | Roles | Controller |
|--------|------|-------|------------|
| GET | `/api/dashboard-stats` | `super_admin` | `DashboardController@stats` |
| GET | `/api/staff-dashboard-stats` | admin + staff | `DashboardController@staffStats` |
| GET | `/api/activity-logs` | `super_admin` | `UserActivityLogController@index` |
| GET/POST/PUT/DELETE | `/api/districts` | `super_admin` | `DistrictController` |
| GET/POST/PUT/DELETE | `/api/offices` | `super_admin` | `OfficeController` |
| GET/POST/PUT/DELETE | `/api/designations` | `super_admin` | `DesignationController` |
| GET/POST/PUT/DELETE | `/api/roles` | `super_admin` | `RoleController` |
| GET/POST/PUT/DELETE | `/api/users` | management | `UserManagementController` |

Stats aggregation: `app/Services/DashboardStatsService.php` (counts by district, status, form type, role-specific models).

---

## 9. Database ER diagram (core relationships)

```mermaid
erDiagram
    states ||--o{ districts : "state_id"
    districts ||--o{ users : "district_id"
    districts ||--o{ offices : "district_id"
    districts ||--o{ village_wards : "district_id"
    offices ||--o{ users : "office_id"
    designations ||--o{ users : "designation_id"
    users ||--o{ user_activity_logs : "user_id"

    users ||--o{ tenancy_applications : "user_id"
    offices ||--o{ tenancy_applications : "office_id"
    village_wards ||--o{ tenancy_applications : "village_ward_id"
    users ||--o{ tenancy_applications : "landlord_user_id"
    users ||--o{ tenancy_applications : "tenant_user_id"
    districts ||--o{ tenancy_applications : "district_id"
    users ||--o{ tenancy_applications : "forwarded_by_user_id"
    users ||--o{ tenancy_applications : "approved_by_user_id"

    users ||--o{ rent_revision_applications : "user_id"
    districts ||--o{ rent_revision_applications : "district_id"
    users ||--o{ rent_revision_applications : "forwarded_by_user_id"
    users ||--o{ rent_revision_applications : "approved_by_user_id"

    users ||--o{ other_charges_revision_applications : "user_id"
    users ||--o{ valuer_appointment_applications : "user_id"
    users ||--o{ rent_court_possession_applications : "user_id"
    users ||--o{ rent_court_filing_applications : "user_id"
    users ||--o{ rent_authority_filing_applications : "user_id"
    users ||--o{ rent_court_appeal_applications : "user_id"
    users ||--o{ rent_tribunal_appeal_applications : "user_id"

    states {
        bigint id PK
        string name
    }

    districts {
        bigint id PK
        string name
        string code
        bigint state_id FK
        bigint assistant_director_id FK
        bigint district_head_id FK
    }

    users {
        bigint id PK
        string name
        string email UK
        string phone UK
        string role
        bigint district_id FK
        bigint office_id FK
        bigint designation_id FK
        string passport_photo_path
        boolean is_blocked
        timestamp approved_at
    }

    tenancy_applications {
        bigint id PK
        string application_no UK
        string ref_code UK
        string status
        string uid UK
        bigint user_id FK
        bigint district_id FK
        bigint office_id FK
        string assigned_to_role
        timestamp forwarded_at
        timestamp approved_at
    }

    rent_revision_applications {
        bigint id PK
        string application_no UK
        string status
        bigint user_id FK
        bigint district_id FK
        string assigned_to_role
        string rent_authority_uid
    }
```

### Master data tables

| Table | Purpose |
|-------|---------|
| `states` | State master (Assam) |
| `districts` | District master + admin FKs |
| `offices` | Rent offices per district |
| `village_wards` | Locality lookup |
| `designations` | Staff designation labels |
| `roles` | Role name registry |
| `user_activity_logs` | Login/logout audit |
| `personal_access_tokens` | Sanctum (if used) |
| `password_resets` | Legacy password reset |

### Shared workflow columns (all application tables)

Added via migrations `add_workflow_fields_to_service_applications` and `add_approval_fields_to_service_applications`:

- `district_id` → `districts`
- `forwarded_at`, `forwarded_by_user_id`
- `rejected_at`, `rejected_by_user_id`, `rejection_message`
- `assigned_to_role`
- `approved_at`, `approved_by_user_id`
- `status`

Service tables also have `user_id` → `users` (citizen applicant).

---

## 10. File storage flow

```mermaid
flowchart LR
    UPLOAD[Multipart upload in controller] --> STORE["storage/app/public"]
    STORE --> PATH["*_path columns in DB"]
    PATH --> URL["VITE_API_URL/storage/{path}"]
    URL --> FE[Frontend View Document]
```

**Examples:** `passport_photo_path`, `signature_image_path`, `agreement_pdf_path`, PAN/Aadhaar paths on `tenancy_applications`.

---

## 11. Controller quick reference

| Area | Controller | Keywords |
|------|------------|----------|
| Auth | `AuthController` | login, register, OTP, session |
| UIN | `TenancyApplicationController` | draft, join, submit, UIN, acknowledgement |
| Service forms | `RentRevisionApplicationController`, `OtherChargesRevisionApplicationController`, `ValuerAppointmentApplicationController`, `RentCourtPossessionApplicationController`, `RentCourtFilingApplicationController`, `RentAuthorityFilingApplicationController`, `RentCourtAppealApplicationController`, `RentTribunalAppealApplicationController` | store, show |
| Workflow | `ApplicationWorkflowController` | inbox, forward, approve, reject, allApplications |
| Citizen aggregate | `TenantFormsStatusController` | tenant-forms/my |
| Admin users | `UserManagementController` | staff CRUD, hierarchy |
| Stats | `DashboardController`, `DashboardStatsService` | statewide / district stats |
| Master data | `DistrictController`, `OfficeController`, `StateController`, `VillageWardController`, `DesignationController`, `RoleController` | CRUD / public read |
| Profile | `ProfileController` | citizen profile |
| Activity | `UserActivityLogController` | super_admin logs |

---

## 12. Key source files

| File | Role |
|------|------|
| `backend/routes/api.php` | All API route definitions + middleware groups |
| `backend/app/Constants/Roles.php` | Role constants and group helpers |
| `backend/app/Constants/ApplicationTypes.php` | Form type slugs + `serviceForms()` |
| `backend/app/Constants/Status.php` | Application status constants |
| `backend/app/Http/Controllers/ApplicationWorkflowController.php` | Service form workflow |
| `backend/app/Http/Controllers/TenancyApplicationController.php` | UIN / tenancy certificate |
| `backend/app/Http/Resources/ApplicationResource.php` | Normalized application JSON |
| `backend/database/migrations/` | Schema history |

---

*Generated from the tenant-system-prototype codebase. Mermaid diagrams render in GitHub, GitLab, VS Code, and Cursor.*
