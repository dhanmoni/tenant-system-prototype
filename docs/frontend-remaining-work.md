# Frontend Remaining Work (TODO)

**Purpose:** Living checklist of unfinished frontend work for the Assam Tenancy Portal prototype.

**Audience:** NIC dev team, reviewers, future maintainers.

**Last reviewed:** 2026-07-30

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

1. Ship or remove **Resources**; replace demo public stats/contacts with live data (or clearly gate them).
2. Wire or delete unrouted admin master-data pages (`OfficeManagement`, `RoleManagement`, `DesignationManagement`, `ActivityLog` — imports removed, files kept); fix approve/block if those UI actions stay.
3. Complete **GIGW** public pages (accessibility statement, feedback, fuller policies); add skip-to-nav.
4. Replace admin `alert()` UX; i18n admin + leftover English; Assamese linguistic review.
5. Finish workspace migration (drop `WorkspaceLegacyFrame`) and add smoke/E2E tests.
6. Continue CSS cleanup carefully: keep landing in `App.css` for now; only extract landing again with a selector-safe approach after visual QA; namespace `.tenancy-*` conflicts.

---

## Landing / public site

- [x] Clean up **orphan landing components** not used by current `Login.jsx` (CitizenServicesSection, HowToApply, TenancyAuthoritiesSection, AboutSection, NotificationsSection, PortalInfoSection, LandingSectionIntro, HeroRotatingLead)
- [x] Clean leftover **legacy public chrome** / commented footer block in `App.jsx`
- [ ] Finish **Resources** (`/resources` is still “coming soon”; `frontend/src/data/resourceDrafts.js` exists but is unused)
- [ ] Replace **demo homepage / public dashboard stats** with a live API — or clearly mark/gate as prototype (`portalPublicStats.js`, `publicDashboardData.js`)
- [ ] Replace **demo footer visitor counter** (`LandingFooter.jsx` / `footer.visitors`)
- [ ] Replace **placeholder helpdesk** contacts and hours (`Contact.jsx`, support contact copy)
- [ ] Add missing **GIGW pages**: Feedback, Accessibility Statement, Guidelines / Help Centre; expand Policies beyond thin Terms + Privacy
- [ ] Remove or wire unused **`frontend/public/DemoUploads/`** assets

---

## Auth / login

- [x] Remove dead **`Register.jsx`** (`/register` only redirects to `/login`)
- [ ] Show a user-facing error when **districts** fail to load (not only `console.error` in `Login.jsx`)
- [ ] Production auth readiness: real OTP / CAPTCHA (still demo/prototype auth — see credentials & GIGW docs)

---

## Dashboard / workspace

- [x] Delete orphan duplicate pages (`DashboardHome`, `DashboardLayout`, `OfficialDashboard`, old `Sidebar`, `ApplicationStatus`, `TenantServices`, legacy `Profile`, `ApplicationInbox`, `StateManagement`)
- [x] Move admin list/detail **routes** into `workspace/pages/admin/*` (Districts, Users, Tenancy, Service applications, Admin details) — bodies still legacy until rewritten
- [x] Move form + citizen application-detail **routes** into `WorkspaceFormPortal` / `WorkspaceApplicationDetails` — `WorkspaceLegacyFrame` unused by routes
- [x] **Districts** body moved to `workspace/pages/admin/` with `ws-district-*` classes (no `ws-legacy-page`)
- [ ] Finish **workspace migration** — rewrite remaining legacy bodies (Users, Tenancy, ApplicationList, forms, details) to `ws-*`; drop `ws-legacy-page` per page
- [ ] Replace **demo notifications** (`DEMO_NOTIFICATIONS` in `WorkspaceLayout.jsx`) with API data
- [ ] Harden large forms (especially **`TenancyCertificate.jsx`**) and catch-all `:formType` service routes
- [ ] Give `/users/:id` consistent **workspace chrome** (currently outside the shell)
- [ ] Update **Assam map GeoJSON** for newer districts (`frontend/public/geo/README.md`)

---

## Admin

- [ ] Wire or remove unrouted master-data UIs: **Offices, Roles, Designations, Activity Log, State** (imported in `App.jsx` / built as pages but not in nav)
- [ ] Fix **approve / block user** actions if buttons stay (UI present; APIs incomplete per super-admin docs)
- [ ] Complete **Form I-B valuer assignment flow** in admin details: assign/reassign/remove valuer, submission/report UX, and clear assignment status updates
- [ ] Replace browser **`alert()`** with in-app toasts/modals (`AdminApplicationDetails`, inbox flows, etc.)
- [ ] Add **i18n** to admin modules (currently English-only hardcoded copy)
- [ ] Clarify dual admin surfaces: legacy `pages/Admin.jsx` vs workspace `/dashboard/admin/*`

---

## i18n

- [ ] **Assamese linguistic / legal review** (`as.js` still marked draft)
- [ ] Translate leftover English surfaces: admin, some workspace loaders / demo strings, compact a11y **“Skip”** label in `Ux4gTopbar.jsx`
- [ ] Keep EN/AS catalog key parity as new strings are added (parity is currently complete for main catalogs)

---

## Polish / accessibility / GIGW

- [ ] Add **Accessibility Statement** / Screen Reader Access page
- [ ] Add **feedback** form/page
- [ ] Render **skip-to-navigation** (helper exists in `skipNavigation.js`; link not shown in UI)
- [ ] Wire or remove unused high-contrast / leftover `.ux4g-a11y-*` styles
- [ ] Add public **site search** if required for go-live
- [ ] Add `sitemap.xml` / `robots.txt` if required for go-live
- [ ] Keep footer **last-updated** / site meta dates accurate (`siteMeta.js`)

---

## Tech debt / quality

- [ ] Extract `styles/landing.css` / `styles/auth.css` only with selector-safe tooling + visual QA (naive split broke cascade; styles re-merged into `App.css`)
- [ ] Add **automated frontend tests** (no test script / no `*.test` files today)
- [ ] Wire or delete kept admin master-data files (`OfficeManagement`, `RoleManagement`, `DesignationManagement`, `ActivityLog`)
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
