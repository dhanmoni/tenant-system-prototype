# App routes audit

**Purpose:** Single map of frontend URLs → pages, what each does, where routing is wrong or poorly nested, and fix priorities.

**Source of truth:** `frontend/src/App.jsx` (+ sidebar links in `frontend/src/workspace/config/navigation.js`).

**Last reviewed:** 2026-08-11

**Related:**

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
| `/resources` | `pages/Resources.jsx` | Resources (still largely “coming soon” / drafts). |
| `/contact` | `pages/Contact.jsx` | Contact / helpdesk. |
| `/sitemap` | `pages/Sitemap.jsx` | HTML sitemap of public + auth entry links. |
| `/public-dashboard` | `pages/PublicDashboard.jsx` | Public demo stats / transparency dashboard. |

---

## 2. Auth helpers & odd-one-outs

| Path | Page / behaviour | Notes |
|------|------------------|--------|
| `/join` | `JoinEntryRedirect` in `App.jsx` | Guest → `/login` with return to join; logged in → `/dashboard/join`. |
| `/dashboard/join` | `pages/JoinApplication.jsx` | Second-party tenancy join (inside workspace). |
| `/admin` | `pages/Admin.jsx` | **Legacy** states/districts/users CRUD. Not the sidebar “Manage assistants”. |
| `/users/:id` | `pages/UserDetail.jsx` | User edit screen. **Protected but not nested under `/dashboard`.** |

---

## 3. Workspace routes (`/dashboard/*`)

Parent: `ProtectedRoute` → `workspace/layout/WorkspaceLayout.jsx` (sidebar, topbar, `<Outlet />`).

| Path | Element | What it does |
|------|---------|--------------|
| `/dashboard` | `WorkspaceHome` → role overview | Role dashboards (citizen / RA / RT / valuer / DA / SA, etc.). |
| `/dashboard/profile` | `WorkspaceProfile` | Edit own profile. |
| `/dashboard/tenancy-certificate` | `TenancyCertificate` | Apply / continue UIN (tenancy certificate). |
| `/dashboard/status` | `WorkspaceUinStatus` | Citizen list of own submissions. |
| `/dashboard/status/:type/:applicationNo` | `ApplicationDetails` in `WorkspaceLegacyFrame` | Citizen view of one application. |
| `/dashboard/services` | `WorkspaceServices` | Services catalogue → opens Form I–VI. |
| `/dashboard/:formType` | `FormPortal` in `WorkspaceLegacyFrame` | Dynamic service form (e.g. `form-vi-rent-tribunal-appeal`). |
| `/dashboard/admin/users` | `UserManagement` + legacy frame | Staff / assistants / user directory. |
| `/dashboard/admin/inbox` | `ApplicationList` | Assistant / valuer queue (inbox endpoint by role). |
| `/dashboard/admin/applications` | `ApplicationList` | Service applications (all / filters). |
| `/dashboard/admin/applications/:applicationNo` | `WorkspaceAdminApplicationDetails` | Staff view/process Form I–VI (+ valuers, proceedings…). |
| `/dashboard/admin/tenancy` | `TenancyRecords` + frame | UIN / tenancy application list. |
| `/dashboard/admin/tenancy/:applicationNo` | `WorkspaceAdminApplicationDetails` | Staff view of a UIN application. |
| `/dashboard/admin/districts` | `WorkspaceDistricts` | Super Admin district management. |
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
| **`/admin` vs `/dashboard/admin/*`** | Two “admin” worlds; `/admin` is old `Admin.jsx`, not in sidebar. | Redirect `/admin` → `/dashboard` or remove; move any needed CRUD into workspace. |
| **`/users/:id` outside shell** | Opens with a11y bar but **no workspace sidebar**. | Nest as `/dashboard/admin/users/:id` (or redirect). |
| **GIGW links in commented footer** | `/guidelines`, `/feedback`, `/help-centre` appear in dead `App.jsx` footer HTML but **have no routes**. | Add pages or delete references. |
| **Unrouted page files still in repo** | `OfficeManagement`, `RoleManagement`, `DesignationManagement`, `ActivityLog`, `ApplicationInbox`, `Register.jsx` (dead body), thin workspace wrappers unused as routes. | Wire or delete (see remaining-work). |
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
| `/admin` | Sibling of `/dashboard`, separate chrome, legacy page. |
| `/users/:id` | Sibling of `/dashboard`; loses workspace nav / consistent title. |
| `/join` | Top-level redirect helper (OK), but target join lives under dashboard — good split if documented. |
| `/login` + `/` | Duplicated landing parents (not nested under a shared `PublicLayout` route). Marketing pages (`/about`, …) also each mount their own `PublicPageLayout` / nav — fine, but no shared React route layout parent. |

### 5.3 Dangerous sibling: `/dashboard/:formType`

Declared as a **param catch-all** under `/dashboard`:

```jsx
<Route path=":formType" element={…FormPortal…} />
```

Static children (`profile`, `admin/users`, …) win when they match, but:

- `/dashboard/admin` (no further segment) can fall into `:formType === "admin"` → **Form not found**.
- Any typo (`/dashboard/profil`) becomes a form slug instead of a 404 page.
- Future routes under `/dashboard/*` must be registered **before** `:formType` or use a reserved prefix (e.g. `/dashboard/forms/:formType`).

**Preferred nesting later:**

```
/dashboard/forms/:formType     ← forms only
/dashboard/admin/*             ← all staff tools
/dashboard/*                   ← citizen workspace
```

### 5.4 Mixed “workspace pages” vs “legacy bodies”

Several routes use **thin workspace wrappers** or **`WorkspaceLegacyFrame` + old `pages/dashboard/*`**:

| Route area | Reality |
|------------|---------|
| Districts | Workspace page (`WorkspaceDistricts`) |
| Admin application details | Workspace wrapper → `AdminApplicationDetails` |
| Users / list / inbox / tenancy / forms | Still mostly legacy components inside frame |

Nesting in the **router** is fine; nesting of **code ownership** is incomplete (see legacy-code-map).

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
| Super Admin | Dashboard, service apps, user management, districts, profile |

Links that staff **use** but aren’t always in sidebar still exist as deep links (e.g. application detail URLs).

---

## 7. Fix priorities (practical)

1. **High — nesting / chrome**
   - Move `/users/:id` under `/dashboard/admin/users/:id` (or redirect).
   - Redirect or remove `/admin` (legacy).
2. **High — catch-all safety**
   - Rename form route to `/dashboard/forms/:formType` (update Services links) **or** add an explicit empty `/dashboard/admin` redirect.
3. **Medium — URL clarity**
   - Document `/` vs `/login` vs `/#login` for the team (this file).
   - Optionally collapse `/login` → `/` with replace.
4. **Medium — dead pages**
   - Delete or route `OfficeManagement`, `RoleManagement`, `DesignationManagement`, `ActivityLog`, unused `ApplicationInbox`.
5. **Low — GIGW**
   - Add `/feedback`, accessibility statement, fuller policies, help centre — or stop advertising them.

---

## 8. Quick reference (all declared pathnames)

```
/                                  landing
/login                             landing (alias)
/register                          → /login
/about /services /policies
/resources /contact /sitemap
/public-dashboard
/join                              → login or /dashboard/join
/admin                             LEGACY (avoid)
/users/:id                         LEGACY chrome gap
/dashboard
/dashboard/profile
/dashboard/tenancy-certificate
/dashboard/status
/dashboard/status/:type/:applicationNo
/dashboard/services
/dashboard/:formType               Form I–VI (catch-all)
/dashboard/admin/users
/dashboard/admin/inbox
/dashboard/admin/applications
/dashboard/admin/applications/:applicationNo
/dashboard/admin/tenancy
/dashboard/admin/tenancy/:applicationNo
/dashboard/admin/districts
/dashboard/join
```

**Not routes:** `/#login`, `/#register`.

---

*When you change `App.jsx` routes, update this file in the same PR.*
