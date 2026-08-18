# App routes audit

**Purpose:** Single map of frontend URLs → pages, what each does, where routing is wrong or poorly nested, and fix priorities.

**Source of truth:** `frontend/src/App.jsx` (+ sidebar links in `frontend/src/workspace/config/navigation.js`).

**Last reviewed:** 2026-08-14

**Related:**

- [legacy-public-shell-reference.md](./legacy-public-shell-reference.md) — undefined routes, HIGHLIGHTS carousel, guest fallback shell
- [legacy-code-map.md](./legacy-code-map.md) — workspace shell vs legacy bodies
- [frontend-remaining-work.md](./frontend-remaining-work.md) — unfinished pages / GIGW gaps
- [frontend-modernization-roadmap.md](./frontend-modernization-roadmap.md)

---

## How routing works (one picture)

```
Guest / marketing          Auth entry              Logged-in workspace
─────────────────          ──────────              ───────────────────
/  /about /services        /login (same as /)      /dashboard  ← WorkspaceLayout
/policies /resources       /register → /login         ├─ index, profile, services…
/contact /sitemap          /#login  (hash only)       ├─ admin/* (staff)
/public-dashboard          /join → login or           └─ :formType (Form I–VI)
                           /dashboard/join

Outside the workspace shell (problem):
  /admin          legacy Admin.jsx
  /users/:id      UserDetail (no sidebar chrome)
```

- React Router matches **pathnames** (`/`, `/login`, `/dashboard/...`).
- `#login` / `#register` are **hashes on the landing page**, not separate routes. Same `Login.jsx`.
- Almost all post-login UI lives under **`/dashboard`** nested in `WorkspaceLayout`.

---

## 1. Public / marketing routes

| Path | Page file | What it does |
|------|-----------|--------------|
| `/` | `pages/Login.jsx` | Landing + Sign in / Register panels. If already logged in → redirect to role home. |
| `/login` | `pages/Login.jsx` | **Same component as `/`**. Kept for protects / join redirects / bookmarks. |
| `/register` | redirect | `Navigate` → `/login` (register UI is a mode on the landing, often `/#register`). |
| `/#login`, `/#register` | *(not routes)* | Hash bookmarks: scroll + open auth panel on landing. |
| `/about` | `pages/About.jsx` | About portal / department. |
| `/services` | `pages/Services.jsx` | Public services catalogue / how to apply. |
| `/policies` | `pages/Policies.jsx` | Policies (partial vs GIGW expectations). |
| `/resources` | `pages/Resources.jsx` | Document catalogue (downloads still gated). |
| `/contact` | `pages/Contact.jsx` | Contact / helpdesk. |
| `/sitemap` | `pages/Sitemap.jsx` | HTML sitemap of public + auth entry links. |
| `/public-dashboard` | `pages/PublicDashboard.jsx` | Public stats from `GET /api/public/portal-stats`. |
| `/feedback` | `pages/Feedback.jsx` | GIGW feedback form (prototype, on-screen only). |
| `/accessibility` | `pages/AccessibilityStatement.jsx` | Accessibility statement. |
| `/help-centre` | `pages/HelpCentre.jsx` | Help / guidelines. |
| `/guidelines` | redirect | → `/help-centre`. |
| `*` | `pages/NotFound.jsx` | Public 404. |

---

## 2. Auth helpers & odd-one-outs

| Path | Page / behaviour | Notes |
|------|------------------|--------|
| `/join` | `JoinEntryRedirect` in `App.jsx` | Guest → `/login` with return to join; logged in → `/dashboard/join`. |
| `/dashboard/join` | `pages/JoinApplication.jsx` | Second-party tenancy join (inside workspace). |
| `/admin` | redirect | → `/dashboard`. Old `pages/Admin.jsx` is no longer routed. |
| `/users/:id` | redirect | → `/dashboard/admin/users/:id` (workspace chrome). |

---

## 3. Workspace routes (`/dashboard/*`)

Parent: `ProtectedRoute` → `workspace/layout/WorkspaceLayout.jsx` (sidebar, topbar, `<Outlet />`).

| Path | Element | What it does |
|------|---------|--------------|
| `/dashboard` | `WorkspaceHome` → role overview | Role dashboards (citizen / RA / RT / valuer / DA / SA, etc.). |
| `/dashboard/profile` | `WorkspaceProfile` | Edit own profile. |
| `/dashboard/tenancy-certificate` | `TenancyCertificate` | Apply / continue UIN (tenancy certificate). |
| `/dashboard/status` | `WorkspaceUinStatus` | Citizen list of own submissions. |
| `/dashboard/status/:type/:applicationNo` | `WorkspaceApplicationDetails` | Citizen view of one application. |
| `/dashboard/services` | `WorkspaceServices` | Services catalogue → opens Form I–VI. |
| `/dashboard/forms/:formType` | `WorkspaceFormPortal` | Dynamic service form (e.g. `form-vi-rent-tribunal-appeal`). |
| `/dashboard/:formType` | `LegacyFormRedirect` | Known form slugs → `/dashboard/forms/...`; else workspace 404. |
| `/dashboard/admin/users/:id` | `WorkspaceUserDetail` | Staff user edit. |
| `/dashboard/admin/users` | `WorkspaceUsers` | Staff / assistants / user directory. |
| `/dashboard/admin/inbox` | `ApplicationList` | Assistant / valuer queue (inbox endpoint by role). |
| `/dashboard/admin/applications` | `ApplicationList` | Service applications (all / filters). |
| `/dashboard/admin/applications/:applicationNo` | `WorkspaceAdminApplicationDetails` | Staff view/process Form I–VI (+ valuers, proceedings…). |
| `/dashboard/admin/tenancy` | `WorkspaceTenancyRecords` | UIN / tenancy application list. |
| `/dashboard/admin/tenancy/:applicationNo` | `WorkspaceAdminApplicationDetails` | Staff view of a UIN application. |
| `/dashboard/admin/districts` | `WorkspaceDistricts` | Super Admin district management. |
| `/dashboard/admin/states` | `WorkspaceStates` | Super Admin state master data. |
| `/dashboard/admin/offices` | `WorkspaceOffices` | Super Admin office CRUD. |
| `/dashboard/admin/designations` | `WorkspaceDesignations` | Super Admin designation CRUD. |
| `/dashboard/admin/roles` | `WorkspaceRoles` | Super Admin role-label CRUD (not login RBAC keys). |
| `/dashboard/admin/activity-log` | `WorkspaceActivityLog` | Super Admin activity log. |
| `/dashboard/join` | `JoinApplication` | Join invite flow when authenticated. |

### Valid `:formType` values (FormPortal)

Must match `APPLICATION_TYPES` in `frontend/src/constants/application.js`:

- `form-i-rent-revision`
- `form-i-a-other-charges-revision`
- `form-i-b-valuer-appointment`
- `form-ii-rent-court-possession`
- `form-iii-rent-court-filing`
- `form-iv-rent-authority-filing`
- `form-v-rent-court-appeal`
- `form-vi-rent-tribunal-appeal`

Unknown `:formType` → “Form not found” (no redirect).

---

## 4. Routes that are wrong / confusing

| Issue | Why it hurts | Suggested direction |
|-------|----------------|---------------------|
| **`/` and `/login` both render landing** | Two pathnames, one page; join/protect use `/login`, marketing uses `/`. | Keep both for now, or canonicalize: `/login` → `/` + hash, document that intentionally. |
| **`/#login` looks like a second site** | Users think it’s another route. | Document as hash bookmark (see above). Optional: only use AuthNavLink state without showing hash. |
| **`/admin` vs `/dashboard/admin/*`** | Was two admin worlds. | **Fixed:** `/admin` redirects to `/dashboard`. |
| **`/users/:id` outside shell** | Was missing workspace sidebar. | **Fixed:** nested under `/dashboard/admin/users/:id`. |
| **GIGW links** | `/guidelines`, `/feedback`, `/help-centre` | **Fixed:** pages exist; `/guidelines` → help centre. |
| **Citizen vs staff detail URLs** | Citizen: `/dashboard/status/:type/:applicationNo`. Staff: `/dashboard/admin/applications/:applicationNo`. Same domain, different pages. | OK if intentional; document; avoid linking the wrong one. |
| **Inbox vs applications share `ApplicationList`** | Same component; behaviour switches on `pathname` (`…/inbox` vs `…/applications`). Easy to break with refactor. | Consider dedicated wrappers/routes or clear prop from route. |

---

## 5. Nesting problems (structure)

### 5.1 Correctly nested

```
/dashboard                          WorkspaceLayout
  ├─ (index) home
  ├─ profile | services | tenancy-certificate | status | status/:type/:no
  ├─ admin/users | inbox | applications | applications/:no
  ├─ admin/tenancy | tenancy/:no | districts
  ├─ join
  └─ :formType                      ← dynamic form portal
```

This is the intended SPA layout: one shell, swap outlet.

### 5.2 Not properly nested

| Path | Problem |
|------|---------|
| `/admin` | **Fixed** — redirects to `/dashboard`. |
| `/users/:id` | **Fixed** — redirects into workspace. |
| `/join` | Top-level redirect helper (OK), but target join lives under dashboard — good split if documented. |
| `/login` + `/` | Duplicated landing parents (not nested under a shared `PublicLayout` route). Marketing pages (`/about`, …) also each mount their own `PublicPageLayout` / nav — fine, but no shared React route layout parent. |

### 5.3 Form routes: `/dashboard/forms/:formType`

Canonical form path is `/dashboard/forms/:formType`. Old `/dashboard/:formType` bookmarks redirect when the slug is a known service form; otherwise the workspace 404 is shown. `/dashboard/admin` (no extra segment) redirects to `/dashboard`.

### 5.4 Mixed “workspace pages” vs “legacy bodies”

Several routes use **thin workspace wrappers** around `pages/dashboard/*` bodies (`WorkspaceLegacyFrame` has been removed):

| Route area | Reality |
|------------|---------|
| Districts / Users / User detail | Workspace pages (`ws-*` bodies) |
| Admin application details | Workspace wrapper → `AdminApplicationDetails` |
| Service list / inbox / tenancy list | Workspace wrappers → list pages |
| Forms / citizen details / UIN apply | Workspace wrappers or `ws-page` directly |

---

## 6. Sidebar ↔ route matrix (expected)

From `getWorkspaceNavigation()` — only links that exist:

| Role | Main nav targets |
|------|------------------|
| Citizen (`user`) | `/dashboard`, UIN apply, status, services, profile |
| Principals (RA / RC / RT) | Dashboard, manage assistants, service apps (± tenancy for RA), profile |
| Assistants | Dashboard, inbox, (± tenancy for RA asst), (± service apps for RT asst), profile |
| Valuer | Dashboard, valuation inbox, profile |
| District Admin | Dashboard, tenancy, service apps, staff directory, profile |
| Super Admin | Dashboard, tenancy, service apps, user management, **master data** (districts, states, offices, designations, roles, activity log), profile |

Links that staff **use** but aren’t always in sidebar still exist as deep links (e.g. application detail URLs).

---

## 7. Fix priorities (practical)

Nesting / chrome / form catch-all work in this file is **done** (`/admin` and `/users/:id` redirect; forms live at `/dashboard/forms/:formType`). Super Admin master-data routes are wired.

Remaining route-adjacent work:

1. **Medium — URL clarity**
   - Keep documenting `/` vs `/login` vs `/#login` (`#login` / `#register` alias to `#auth-card-section`).
   - Optionally collapse `/login` → `/` with replace.
2. **Low — GIGW**
   - Expand policy text; connect feedback form to a real mailbox (page exists, on-screen only).

See [frontend-remaining-work.md](./frontend-remaining-work.md) for the full leftover list.

---

## 8. Quick reference (all declared pathnames)

```
/                                  landing
/login                             landing (alias)
/register                          → /login
/about /services /policies
/resources /contact /sitemap
/public-dashboard
/feedback /accessibility /help-centre
/guidelines                        → /help-centre
/join                              → login or /dashboard/join
/admin                             → /dashboard
/users/:id                         → /dashboard/admin/users/:id
/dashboard
/dashboard/profile
/dashboard/tenancy-certificate
/dashboard/status
/dashboard/status/:type/:applicationNo
/dashboard/services
/dashboard/forms/:formType         Form I–VI
/dashboard/:formType               redirect known forms or 404
/dashboard/admin/users
/dashboard/admin/users/:id
/dashboard/admin/inbox
/dashboard/admin/applications
/dashboard/admin/applications/:applicationNo
/dashboard/admin/tenancy
/dashboard/admin/tenancy/:applicationNo
/dashboard/admin/districts
/dashboard/admin/states
/dashboard/admin/offices
/dashboard/admin/designations
/dashboard/admin/roles
/dashboard/admin/activity-log
/dashboard/join
*                                  public 404
```

**Not routes:** `/#login`, `/#register`.

**Catch-all:** Public `*` → `NotFound`. Dashboard unknown slugs → `WorkspaceNotFound` (via `LegacyFormRedirect`). See [legacy-public-shell-reference.md](./legacy-public-shell-reference.md).

---

*When you change `App.jsx` routes, update this file in the same PR.*
