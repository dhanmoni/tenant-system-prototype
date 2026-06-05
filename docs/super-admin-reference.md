# Super Admin — Powers Reference (Prototype)

**Purpose:** Single reference for what the **super admin** (`super_admin`) role can do today in this prototype, how that differs from other roles, and what we should **add**, **improve**, or **remove** before production.

**Last reviewed:** 2026-06-03 (codebase snapshot)

**Related docs:**

- [Demo_NIC_Credentials.md](../Demo_NIC_Credentials.md) — login flow, demo OTP, role matrix (some UI items listed there are **not** wired yet; see gaps below)
- [docs/backend-architecture.md](../docs/backend-architecture.md) — API and data model overview

---

## Demo access

| Field | Value |
| ----- | ----- |
| Role | `super_admin` |
| Phone (login) | `9999999999` |
| Email (reference) | `admin@nic.in` |
| OTP (demo) | `123456` |

Sign-in: phone + OTP via `POST /api/login`. Password fallback exists for backward compatibility only.

**Scope label in UI:** “Statewide (Assam)” — data is not filtered by `district_id`; super admin sees **all districts** and **all applications**.

---

## Role position in the system

```mermaid
flowchart TB
  SA[super_admin]
  DA[district_admin]
  P[rent_authority / rent_court / rent_tribunal]
  A[ra_assistant / rc_assistant / rt_assistant]
  U[user - citizen]

  SA -->|creates| DA
  SA -->|creates| P
  DA -->|views only - no create in UI| P
  DA -->|views only - no create in UI| A
  P -->|creates| A
  U -->|submits| Apps[Applications & UIN]
  A -->|verify / forward| Apps
  P -->|approve / reject| Apps
  SA -->|monitor only - no workflow UI| Apps
  DA -->|district-scoped lists| Apps
```

Super admin is a **platform operator**: master data, accounts, and **read-only oversight** of applications—not a desk officer in the RA/RC/RT workflow.

---

## Current powers

### 1. Workspace navigation (sidebar)

Routes under `/dashboard` for `super_admin` today:

| Nav item | Path | Notes |
| -------- | ---- | ----- |
| Dashboard | `/dashboard` | `SuperAdminDashboard` + statewide stats |
| User management | `/dashboard/admin/users` | Staff + citizens (`?mode=tenant` for citizens) |
| Service applications | `/dashboard/admin/applications` | All forms, all districts |
| Tenancy applications | `/dashboard/admin/tenancy` | UIN / tenancy records |
| Districts | `/dashboard/admin/districts` | Add / delete districts |
| My profile | `/dashboard/profile` | Same as other roles |

**Not in sidebar (but may exist in code or API):** Application inbox, UIN status (citizen flow), States, Offices, Designations, Roles, dedicated Activity log page.

Source: `frontend/src/workspace/config/navigation.js`

---

### 2. Dashboard & monitoring

| Capability | API | UI |
| ---------- | --- | -- |
| Statewide dashboard stats | `GET /api/dashboard-stats` (**super admin only**) | `SuperAdminDashboard`, `OfficialOverview` |
| Recent activity snippet | `GET /api/activity-logs` | `ActivityFeed` on super admin dashboard; legacy `DashboardHome` also loads logs |
| Charts / district map / form breakdown | Included in stats payload | Shown on super admin dashboard |
| Quick actions | — | Users, service apps, tenancy, districts |

Stats include (among others): states, districts, offices, roles, designations, user counts, tenancy + service application counts, status pipeline, district breakdown.

Source: `backend/app/Services/DashboardStatsService.php`, `backend/app/Http/Controllers/DashboardController.php`

---

### 3. Master data (API: super admin only)

| Resource | Endpoints | UI today |
| -------- | --------- | -------- |
| Districts | `GET/POST/PUT/DELETE /api/districts` | **Yes** — `DistrictManagement` |
| Offices | `/api/offices` (apiResource) | **No dedicated route** — page exists (`OfficeManagement.jsx`) but not mounted in workspace |
| Designations | `/api/designations` | **No dedicated route** — `DesignationManagement.jsx` imported, not routed |
| Roles | `/api/roles` | **No dedicated route** — `RoleManagement.jsx` imported, not routed |
| States | Public: `GET /api/public/states` only | **No admin CRUD** — `StateManagement.jsx` exists; import **commented out** in `App.jsx`; no API resource for authenticated state CRUD |

Quick action copy says “Districts & states” and “offices, roles, and designations,” but the linked screen is **districts only**.

---

### 4. User & account management

| Capability | Backend | Frontend |
| ---------- | ------- | -------- |
| List all users (no district filter) | `GET /api/users` | User management table |
| View / edit user | `GET/PUT /api/users/{id}` | `/users/:id` (`UserDetail`) — loads offices, designations, roles via super-admin APIs |
| Create user | `POST /api/users` | **Limited roles in UI** (see below) |
| Delete user | `DELETE /api/users/{id}` | Delete button on `UserDetail` (**works** if route allowed) |
| Approve pending registration | `UserManagementController::approve` | Button on `UserDetail` — **`POST /api/users/{id}/approve` is not registered in `api.php`** (broken) |
| Block / unblock citizen | `toggleBlock` | Toggle for `user` role only — **`POST /api/users/{id}/toggle-block` not registered in `api.php`** (broken) |

**Create-user UI restriction (super admin):** only `district_admin` and principal roles (`rent_authority`, `rent_court`, `rent_tribunal`). Assistants and other super admins are **not** in the dropdown, even though the controller comment says “Super admin can create anyone.”

Source: `frontend/src/pages/dashboard/admin/UserManagement.jsx` (`getAllowedRoles`), `backend/app/Http/Controllers/UserManagementController.php`

**Shared with district admin & principals:** management middleware `Roles::allManagement()` — super admin is included.

**District admin difference:** user list filtered to their district; cannot create staff in UI (`getAllowedRoles` returns `[]`).

---

### 5. Applications & tenancy (oversight)

| Capability | Super admin | District admin |
| ---------- | ----------- | -------------- |
| All service applications (statewide) | `GET /api/admin/applications/all` | Same endpoint, **filtered by district** |
| Tenancy / UIN records | `GET /api/admin/tenancy-records` | District-scoped |
| View application by number | `GET /api/admin/applications/{applicationNo}` | District check unless super admin |
| Inbox (assistant queue) | API: **403** (`Only assistants`) | N/A |
| Forward / approve / reject | API: **403** (assistants / principals only) | Same |
| Workflow buttons in list UI | **Hidden** — view only | Shown for assistants / principals |

Super admin uses the **“all applications”** list with **View** only (`ApplicationList.jsx`).

---

### 6. What super admin does **not** do (by design today)

- Citizen flows: register tenancy, submit Assam Tenancy Act forms, UIN status tracking (no `UIN status` nav item).
- Assistant inbox: verify and forward submissions.
- Principal decisions: approve or reject service applications (no UI; API would reject anyway).
- District-scoped staff creation (that is principals / super admin for heads, not DA in UI).

---

## Comparison: super admin vs district admin

| Area | Super admin | District admin |
| ---- | ----------- | -------------- |
| Geographic scope | All districts | Assigned `district_id` only |
| Dashboard API | `/api/dashboard-stats` | `/api/staff-dashboard-stats` |
| District CRUD | Yes | No |
| Offices / roles / designations CRUD (API) | Yes | No |
| Activity logs (API) | Yes | No |
| Create staff in UI | DA + RA/RC/RT heads only | No (view staff directory only) |
| Service applications | Statewide list | District list |
| Workflow actions | No | No (DA is not principal/assistant) |

---

## Gaps and inconsistencies (fix or document)

1. **`Demo_NIC_Credentials.md` §5** lists State Management, Office Management, Role Management, and User Activity Log as super-admin screens — **most are not routed** in the workspace app.
2. **Approve / block user** — controller methods exist; **routes missing** in `backend/routes/api.php`.
3. **“Districts & states” quick action** — only districts implemented; no state admin UI or authenticated state API.
4. **Dead imports** in `App.jsx`: `OfficeManagement`, `RoleManagement`, `DesignationManagement`, `ActivityLog` — no `/dashboard/admin/...` routes.
5. **User create mismatch** — backend allows any role for super admin; UI restricts to DA + principals; assistants must be created by principals (or fix UI).
6. **No audit UI** — activity logs API works; no full-page log viewer in workspace nav.
7. **No RBAC on user delete/update** — `destroy` / `update` have no extra checks beyond `managementRoles` middleware (any principal could delete users in API unless tightened).
8. **Demo auth** — fixed OTP; not suitable for production.
9. **Legacy `UserDetail`** — old dashboard layout links; super admin primary path is workspace.

---

## Recommended changes

### Add

| Item | Rationale |
| ---- | --------- |
| Register `POST /api/users/{user}/approve` and `POST /api/users/{user}/toggle-block` | Wire existing controller methods used by `UserDetail` |
| Workspace routes + nav for **Offices**, **Designations**, **Roles** | APIs already super-admin-only; match quick-action copy |
| **Activity log** page (`/dashboard/admin/activity`) | Full searchable log; API exists |
| **State / UT master data** (if multi-state) | Admin CRUD + route; or remove “states” from marketing copy if Assam-only |
| Super admin UI to create **assistants** (optional) | Align with backend “create anyone” or document that only principals create assistants |
| **Assign / change district** on user create form | Required for DA and principals; validate against districts list |
| **Impersonation / support mode** (future) | Read-only view as district user for support (out of scope for prototype) |
| **Export** (users, applications CSV) | Operations and reporting |
| Production auth (real OTP, lockout, session policy) | Security |

### Improve

| Item | Rationale |
| ---- | --------- |
| Align **Demo_NIC_Credentials.md** with actual sidebar | Avoid stakeholder confusion |
| Single dashboard entry | `DashboardHome` vs `OfficialOverview` / workspace — reduce duplicate activity-log fetches |
| **Delete user** — confirm dialog, prevent deleting self / last super admin | Safety |
| **Role change guards** | Prevent demoting the only super admin or breaking district principal FKs |
| District delete rules | Block delete if users or open applications reference district |
| Application detail for super admin | Read-only banner: “Oversight only — processing happens in district workflow” |
| Consolidate master data under one **“Platform settings”** hub | Districts, offices, designations, roles, states |
| Server-side validation mirroring UI `getAllowedRoles` | Consistent permissions |

### Remove or defer

| Item | Rationale |
| ---- | --------- |
| Commented **StateManagement** import and unused admin pages **or** wire them — avoid dead code | Clarity |
| Misleading quick-action subtitle (“offices, roles, designations”) until pages exist | UX honesty |
| Granting super admin **workflow approve** in API middleware | `allAdminStaffRoles` includes super admin on workflow routes but methods return 403 — consider excluding `super_admin` from that middleware group to reduce attack surface |
| Legacy non-workspace **UserDetail** nav chrome | If workspace is canonical |
| Demo OTP `123456` in production builds | Security |

---

## API quick reference (super admin exclusive)

```
GET  /api/dashboard-stats
GET  /api/activity-logs
GET|POST|PUT|DELETE  /api/districts[/{id}]
GET|POST|PUT|DELETE  /api/offices[/{id}]
GET|POST|PUT|DELETE  /api/designations[/{id}]
GET|POST|PUT|DELETE  /api/roles[/{id}]
```

## API quick reference (shared with other management roles)

```
GET|POST       /api/users
GET|PUT|DELETE /api/users/{user}
GET            /api/admin/tenancy-records
GET            /api/admin/applications/all
GET            /api/admin/applications/{applicationNo}
GET            /api/admin/applications/{type}/{id}
```

## API quick reference (not available to super admin in practice)

```
GET  /api/admin/applications/inbox          → assistants only
GET  /api/admin/applications/principal-inbox → principals only
POST /api/admin/applications/.../forward    → assistants only
POST /api/admin/applications/.../approve    → principals only
POST /api/admin/applications/.../reject     → assistants + principals
```

---

## Key source files

| Area | Path |
| ---- | ---- |
| Role constants | `backend/app/Constants/Roles.php` |
| API routes | `backend/routes/api.php` |
| User management | `backend/app/Http/Controllers/UserManagementController.php` |
| Workflow | `backend/app/Http/Controllers/ApplicationWorkflowController.php` |
| Stats | `backend/app/Services/DashboardStatsService.php` |
| Workspace nav | `frontend/src/workspace/config/navigation.js` |
| Super admin dashboard | `frontend/src/workspace/pages/official/SuperAdminDashboard.jsx` |
| Districts UI | `frontend/src/pages/dashboard/admin/DistrictManagement.jsx` |
| Users UI | `frontend/src/pages/dashboard/admin/UserManagement.jsx` |

---

## Changelog (this document)

| Date | Note |
| ---- | ---- |
| 2026-06-03 | Initial reference from prototype codebase review |
