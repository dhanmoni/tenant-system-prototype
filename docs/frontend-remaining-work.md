# Frontend Remaining Work (TODO)

**Purpose:** Living checklist of unfinished frontend work for the Assam Tenancy Portal prototype.

**Audience:** NIC dev team, reviewers, future maintainers.

**Last reviewed:** 2026-08-13

**Related docs:**

- [frontend-modernization-roadmap.md](./frontend-modernization-roadmap.md) — migration plan and system ratings
- [app-routes.md](./app-routes.md) — full route list, wrong pages, nesting issues
- [gigw-compliance-snapshot.md](./gigw-compliance-snapshot.md) — GIGW / a11y public-site gaps
- [legacy-code-map.md](./legacy-code-map.md) — where legacy dashboard code still lives
- [accessibility-ux4g-plan.md](./accessibility-ux4g-plan.md) — UX4G accessibility plan
- [super-admin-reference.md](./super-admin-reference.md) — admin product gaps and missing APIs
- [Demo_NIC_Credentials.md](../Demo_NIC_Credentials.md) — demo logins (some screens described there are not routed)

---

## Highest priority

1. ~~Replace demo public stats with live data~~ Public dashboard uses `GET /api/public/portal-stats`. Homepage stats bar is still sample. Contact page uses TCP Assam published email/phone.
2. ~~Fix approve/block user actions~~ Approve route registered; detail page deactivates (with reason) instead of delete.
3. Assamese linguistic / legal review; i18n remaining admin copy; skip-to-nav link in UI.
4. Add smoke/E2E tests (`WorkspaceLegacyFrame` removed).
5. Continue CSS cleanup carefully: keep landing in `App.css` for now; namespace `.tenancy-*` conflicts.

---

## Landing / public site

- [x] Clean up **orphan landing components** not used by current `Login.jsx` (CitizenServicesSection, HowToApply, TenancyAuthoritiesSection, AboutSection, NotificationsSection, PortalInfoSection, LandingSectionIntro, HeroRotatingLead)
- [x] Clean leftover **legacy public chrome** / commented footer block in `App.jsx`
- [x] Finish **Resources** listing (downloads still gated as coming soon)
- [x] **Public dashboard** uses live `GET /api/public/portal-stats` (no sample figures)
- [x] Remove fake **footer visitor counter**; last-updated uses `siteMeta.js`
- [x] Gate **placeholder helpdesk** (no fake phone numbers; Contact + citizen sidebar point to `/contact`; TCP office address kept)
- [x] Add **GIGW pages**: Feedback, Accessibility Statement, Help Centre; Policies links to them; `robots.txt` + `sitemap.xml`
- [x] Wire **`frontend/public/DemoUploads/`** (sample agreement on Documents; UIN + join “Attach sample documents”)
- [x] Public **404** page; remove legacy HIGHLIGHTS shell

---

## Auth / login

- [x] Remove dead **`Register.jsx`** (`/register` only redirects to `/login`)
- [x] Show a user-facing error when **districts** fail to load (with retry)
- [ ] Production auth readiness: real OTP / CAPTCHA (still demo/prototype auth — see credentials & GIGW docs)

---

## Dashboard / workspace

- [x] Delete orphan duplicate pages (`DashboardHome`, `DashboardLayout`, `OfficialDashboard`, old `Sidebar`, `ApplicationStatus`, `TenantServices`, legacy `Profile`, `ApplicationInbox`, `StateManagement`)
- [x] Move admin list/detail **routes** into `workspace/pages/admin/*` (Districts, Users, Tenancy, Service applications, Admin details) — bodies still legacy until rewritten
- [x] Move form + citizen application-detail **routes** into `WorkspaceFormPortal` / `WorkspaceApplicationDetails` — `WorkspaceLegacyFrame` unused by routes
- [x] **Districts** body moved to `workspace/pages/admin/` with `ws-district-*` classes (no `ws-legacy-page`)
- [x] Restyle **Users / UserDetail** to `ws-user-detail`; drop `ws-legacy-page` on users, service list, tenancy list, and admin details wrappers
- [x] Service list / inbox: fetch error + retry; View/back returns assistants & valuers to `/admin/inbox`
- [x] Restrict **tenancy records** to RA / RA assistant / district admin / super admin (RC/RT cannot open via URL)
- [x] Wire **ServiceFormShell** on FormPortal (breadcrumb + form header); drop duplicate panel titles; `ws-btn` on form actions
- [x] Restyle citizen **ApplicationDetails** (breadcrumb, status badges, withdraw confirm modal; drop `auth-card`)
- [x] **UIN status** withdraw on submitted apps (in-app confirm, no `window.confirm`); orphan `ApplicationStatus.jsx` deleted
- [x] **TenancyCertificate**: breadcrumb; conflict actions use `ws-btn`; drop unused `WorkspaceLegacyFrame`
- [x] Replace **demo notifications** with recent application updates (no dedicated notifications API yet)
- [x] Delete unrouted master-data pages (`OfficeManagement`, `RoleManagement`, `DesignationManagement`, `ActivityLog`, `ApplicationInbox`, `Register`, `Admin.jsx`)
- [x] Move service forms to `/dashboard/forms/:formType`; unknown dashboard slugs show workspace 404
- [ ] Further harden **TenancyCertificate** (validation / joint-party edge cases)
- [x] Give `/users/:id` workspace chrome (`/dashboard/admin/users/:id`; old path redirects)
- [ ] Update **Assam map GeoJSON** for newer districts (`frontend/public/geo/README.md`)

---

## Admin

- [ ] Wire or remove unrouted master-data UIs: **Offices, Roles, Designations, Activity Log, State** (imported in `App.jsx` / built as pages but not in nav)
- [x] Wire **approve** (`POST /api/users/{id}/approve`); replace Delete with **deactivate** (reason required, same as users list)
- [x] Form I-B valuer assign/reassign/remove uses in-app confirm (no `window.confirm`); retry if valuer list fails to load
- [x] Admin application details: breadcrumb + role-aware Back (inbox vs applications vs tenancy)
- [ ] Add **i18n** to remaining admin modules (Users + inbox/service list + tenancy list done; application details and districts still English)
- [x] Redirect legacy `/admin` → `/dashboard`
- [x] Replace live-page **`alert()`** with toasts (`AdminApplicationDetails`, citizen `ApplicationDetails`)

---

## i18n

- [ ] **Assamese linguistic / legal review** (`as.js` still marked draft)
- [ ] Translate leftover English surfaces: admin application details, districts, some workspace loaders / demo strings (`Ux4gTopbar` Skip is i18n’d)
- [ ] Keep EN/AS catalog key parity as new strings are added (parity is currently complete for main catalogs)

---

## Polish / accessibility / GIGW

- [x] Add **Accessibility Statement** / Screen Reader Access page
- [x] Add **feedback** form/page
- [x] Render **skip-to-navigation** (Tab from top of page; also skip-to-content)
- [ ] Wire or remove unused high-contrast / leftover `.ux4g-a11y-*` styles
- [ ] Add public **site search** if required for go-live
- [x] Add `sitemap.xml` / `robots.txt` if required for go-live
- [ ] Keep footer **last-updated** / site meta dates accurate (`siteMeta.js`)

---

## Tech debt / quality

- [ ] Extract `styles/landing.css` / `styles/auth.css` only with selector-safe tooling + visual QA (naive split broke cascade; styles re-merged into `App.css`)
- [ ] Add **automated frontend tests** (no test script / no `*.test` files today)
- [x] Delete kept admin master-data files (`OfficeManagement`, `RoleManagement`, `DesignationManagement`, `ActivityLog`)
- [ ] Replace Vite template **`frontend/README.md`** with project-specific frontend notes
- [ ] Consider a shared API / data layer (roadmap Phase 4 — React Query or services modules)
- [ ] Normalize error handling (fewer `console.error` + `alert` paths; prefer inline/toast UX)
- [ ] Delete remaining dead topbar / legacy hero CSS in `App.css`; namespace `.tenancy-*` conflicts

---

## Suggested sprint order

| Must | Should | Later |
| ---- | ------ | ----- |
| Resources + real/gated public stats & contacts | Workspace orphan cleanup | Shared data layer |
| GIGW pages + skip-to-nav | Admin i18n + Assamese review | Site search / sitemap |
| Admin route wire-or-delete + approve/block honesty | Drop `WorkspaceLegacyFrame` | GeoJSON district update |
| Replace admin `alert()` | Smoke/E2E for role flows | Full frontend README rewrite |

---

## Notes

- This list is **frontend-focused**. Backend gaps (e.g. missing user approve/block routes) are called out only where they block UI.
- Check items off in PRs and bump **Last reviewed** when the list changes.
- For architecture/migration sequencing, prefer [frontend-modernization-roadmap.md](./frontend-modernization-roadmap.md).
