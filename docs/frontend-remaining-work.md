# Frontend Remaining Work (TODO)

**Purpose:** Living checklist of unfinished frontend work for the Assam Tenancy Portal prototype.

**Audience:** NIC dev team, reviewers, future maintainers.

**Last reviewed:** 2026-07-28

**Related docs:**

- [frontend-modernization-roadmap.md](./frontend-modernization-roadmap.md) — migration plan and system ratings
- [gigw-compliance-snapshot.md](./gigw-compliance-snapshot.md) — GIGW / a11y public-site gaps
- [legacy-code-map.md](./legacy-code-map.md) — where legacy dashboard code still lives
- [accessibility-ux4g-plan.md](./accessibility-ux4g-plan.md) — UX4G accessibility plan
- [super-admin-reference.md](./super-admin-reference.md) — admin product gaps and missing APIs
- [Demo_NIC_Credentials.md](../Demo_NIC_Credentials.md) — demo logins (some screens described there are not routed)

---

## Highest priority

1. Ship or remove **Resources**; replace demo public stats/contacts with live data (or clearly gate them).
2. Wire or delete unrouted admin master-data pages; fix approve/block if those UI actions stay.
3. Complete **GIGW** public pages (accessibility statement, feedback, fuller policies); add skip-to-nav.
4. Replace admin `alert()` UX; i18n admin + leftover English; Assamese linguistic review.
5. Finish workspace migration (delete orphans, drop `WorkspaceLegacyFrame`) and add smoke/E2E tests.

---

## Landing / public site

- [ ] Finish **Resources** (`/resources` is still “coming soon”; `frontend/src/data/resourceDrafts.js` exists but is unused)
- [ ] Replace **demo homepage / public dashboard stats** with a live API — or clearly mark/gate as prototype (`portalPublicStats.js`, `publicDashboardData.js`)
- [ ] Replace **demo footer visitor counter** (`LandingFooter.jsx` / `footer.visitors`)
- [ ] Replace **placeholder helpdesk** contacts and hours (`Contact.jsx`, support contact copy)
- [ ] Add missing **GIGW pages**: Feedback, Accessibility Statement, Guidelines / Help Centre; expand Policies beyond thin Terms + Privacy
- [ ] Clean up **orphan landing components** not used by current `Login.jsx` (e.g. `CitizenServicesSection`, `HowToApply`, `TenancyAuthoritiesSection`)
- [ ] Clean leftover **legacy public chrome** / commented footer block in `App.jsx`
- [ ] Remove or wire unused **`frontend/public/DemoUploads/`** assets

---

## Auth / login

- [ ] Remove dead **`Register.jsx`** (Lorem ipsum; `/register` only redirects to `/login`)
- [ ] Show a user-facing error when **districts** fail to load (not only `console.error` in `Login.jsx`)
- [ ] Production auth readiness: real OTP / CAPTCHA (still demo/prototype auth — see credentials & GIGW docs)

---

## Dashboard / workspace

- [ ] Finish **workspace migration** — drop `WorkspaceLegacyFrame`, reduce dual CSS (`App.css` + `workspace.css`)
- [ ] Replace **demo notifications** (`DEMO_NOTIFICATIONS` in `WorkspaceLayout.jsx`) with API data
- [ ] Delete or re-route **orphan duplicate pages** (e.g. `DashboardHome`, `DashboardLayout`, `OfficialDashboard`, old `Sidebar`, `ApplicationStatus`, `TenantServices`, legacy `Profile` / inbox duplicates)
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

- [ ] Add **automated frontend tests** (no test script / no `*.test` files today)
- [ ] Remove **dead imports** in `App.jsx` (`OfficeManagement`, `RoleManagement`, `DesignationManagement`, `ActivityLog`, `Register`, etc.)
- [ ] Replace Vite template **`frontend/README.md`** with project-specific frontend notes
- [ ] Consider a shared API / data layer (roadmap Phase 4 — React Query or services modules)
- [ ] Normalize error handling (fewer `console.error` + `alert` paths; prefer inline/toast UX)

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
