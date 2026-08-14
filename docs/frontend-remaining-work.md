# Frontend Remaining Work (TODO)

**Purpose:** Living checklist of unfinished frontend work for the Assam Tenancy Portal prototype.

**Audience:** NIC dev team, reviewers, future maintainers.

**Last reviewed:** 2026-08-14

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

1. **Assamese linguistic / legal review**; leftover English on some admin workflow modals / valuer copy.
2. Add **smoke / E2E tests** for role flows (no frontend test script today).
3. Continue CSS cleanup carefully: keep landing in `App.css` for now (do not naive-split).

---

## Landing / public site

- [x] Clean up **orphan landing components** not used by current `Login.jsx`
- [x] Clean leftover **legacy public chrome** / commented footer block in `App.jsx`
- [x] Finish **Resources** listing (downloads still gated as coming soon — honest empty state)
- [x] **Public dashboard** uses live `GET /api/public/portal-stats` (no sample figures)
- [x] **Homepage stats strip** uses the same live API (`mapPortalKpis` / `PORTAL_STAT_DEFS`)
- [x] Remove fake **footer visitor counter**; last-updated uses `siteMeta.js`
- [ ] Keep footer **last-updated** / site meta dates accurate (`siteMeta.js` currently `14 August 2026`)
- [x] Gate **placeholder helpdesk** (Contact + citizen sidebar point to `/contact`; TCP office address kept)
- [x] Add **GIGW pages**: Feedback, Accessibility Statement, Help Centre; Policies links to them; `robots.txt` + `sitemap.xml`
- [x] Wire **`frontend/public/DemoUploads/`** (sample agreement on Documents; UIN + join “Attach sample documents”)
- [x] Public **404** page; remove legacy HIGHLIGHTS shell
- [ ] Add public **site search** if required for go-live

---

## Auth / login

- [x] Remove dead **`Register.jsx`** (`/register` only redirects to `/login`)
- [x] Show a user-facing error when **districts** fail to load (with retry)
- [x] Login / Register nav hashes scroll to `#auth-card-section` on first click (home + other public pages)
- [ ] Production auth readiness: real OTP / CAPTCHA (still demo/prototype auth — see credentials & GIGW docs)

---

## Dashboard / workspace

- [x] Rebuild Super Admin master-data pages and sidebar: **States, Offices, Designations, Roles, Activity log** (with Districts)
- [x] Move admin list/detail **routes** into `workspace/pages/admin/*`
- [x] Move form + citizen application-detail **routes** into `WorkspaceFormPortal` / `WorkspaceApplicationDetails`
- [x] **Districts** body moved to `workspace/pages/admin/` with `ws-district-*` classes
- [x] Restyle **Users / UserDetail** to `ws-user-detail`
- [x] Service list / inbox: fetch error + retry; View/back returns assistants & valuers to `/admin/inbox`
- [x] Restrict **tenancy records** to RA / RA assistant / district admin / super admin (RC/RT cannot open via URL)
- [x] Wire **ServiceFormShell**; match All-services badge colours; drop side gutters from `max-width` on form pages
- [x] Restyle citizen **ApplicationDetails**; withdraw confirm modal
- [x] **UIN status** withdraw on submitted apps (in-app confirm)
- [x] **TenancyCertificate**: breadcrumb; conflict actions use `ws-btn`
- [x] Replace **demo notifications** with recent application updates (no dedicated notifications API yet)
- [x] Complete-profile overlay: show once per session, auto-dismiss after 5s, push a workspace notification
- [x] Optimistic **Sign out** (overlay no longer intercepts the first click)
- [x] Give `/users/:id` workspace chrome (`/dashboard/admin/users/:id`; old path redirects)
- [x] Move service forms to `/dashboard/forms/:formType`; unknown dashboard slugs show workspace 404
- [ ] Further harden **TenancyCertificate** (validation / joint-party edge cases)
- [x] **Assam map GeoJSON** aligned to current 35 districts; sub-district names canonicalised to portal labels

---

## Admin

- [x] **Master data in sidebar:** Offices, Roles, Designations, Activity Log, States (`/dashboard/admin/*`). Super Admin only. Authenticated `GET/POST/PUT/DELETE /api/states` registered.
- [x] Wire **approve** (`POST /api/users/{id}/approve`); replace Delete with **deactivate** (reason required)
- [x] Form I-B valuer assign/reassign/remove uses in-app confirm; retry if valuer list fails
- [x] Admin application details: breadcrumb + role-aware Back
- [x] Add **i18n** to remaining admin modules (Users + inbox/service list + tenancy list + **application details** + **districts**)
- [x] Redirect legacy `/admin` → `/dashboard`
- [x] Replace live-page **`alert()`** with toasts (`AdminApplicationDetails`, citizen `ApplicationDetails`)

---

## i18n

- [ ] **Assamese linguistic / legal review** (`as.js` still marked draft)
- [ ] Translate leftover English: some workflow/valuer modal copy, workspace route loaders, demo strings
- [ ] Keep EN/AS catalog key parity as new strings are added (parity is currently complete for main catalogs)

---

## Polish / accessibility / GIGW

- [x] Add **Accessibility Statement** / Screen Reader Access page
- [x] Add **feedback** form/page (layout aligned with Contact)
- [x] Render **skip-to-navigation** (Tab from top of page; also skip-to-content)
- [x] Align tablet/laptop **scroll-up FAB** over the UX4G a11y FAB
- [x] Dashboard nav dropdown opens to the **right** of the trigger (not centred)
- [x] Portal Services cards deep-link to matching **Services** page sections
- [x] Delete unused leftover `.ux4g-a11y-*` styles (official UX4G widget only)
- [x] Reduced-motion + print: skip widget/FAB animations and hide widget chrome when printing

---

## Tech debt / quality

- [x] Delete unused `.tenancy-steps` stepper CSS; scope `.tenancy-form .form-actions` to UIN/join pages so they do not clash with service forms
- [x] Shared API helpers under `frontend/src/services/` (portal stats, districts, activity logs, admin applications)
- [x] Drop leftover `alert()` toast fallback; replace `console.error` on admin details / login / layout / UIN draft with inline/toast errors
- [x] Footer last-updated: `siteMeta.js` set to 14 August 2026
- [x] i18n EN/AS for **districts** and **admin application details** chrome (sections, back, print, save, errors)
- [ ] Add **automated frontend tests** (no test script / no `*.test` files today)
- [ ] Replace Vite template **`frontend/README.md`** with project-specific frontend notes

---

## Suggested sprint order

| Must | Should | Later |
| ---- | ------ | ----- |
| Assamese linguistic / legal review | TenancyCertificate harden | Site search |
| Smoke/E2E for role flows | Remaining App.css dead chrome | Full frontend README rewrite |

---

## Notes

- This list is **frontend-focused**. Backend gaps are called out only where they block UI.
- Check items off in PRs and bump **Last reviewed** when the list changes.
- For architecture/migration sequencing, prefer [frontend-modernization-roadmap.md](./frontend-modernization-roadmap.md).
