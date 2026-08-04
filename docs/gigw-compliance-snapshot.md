# GIGW 3.0 — Compliance Snapshot

Assessment of the Assam Tenancy Registration & Management System prototype against **Guidelines for Indian Government Websites and Apps (GIGW) 3.0**.

GIGW 3.0 is organised around four pillars:

1. Quality  
2. Accessibility (WCAG 2.1 Level AA)  
3. Cybersecurity  
4. Lifecycle management  

Official references:

- [GIGW portal](https://guidelines.india.gov.in/)  
- [Conformity matrix (Annexure II)](https://guidelines.india.gov.in/annexure-ii-matrix-to-check-conformity/)  
- STQC Website Quality Certification (CQW)

**Date of review:** 25 Jul 2026 (refreshed)  
**Previous review:** 23 Jul 2026  
**Scope:** Frontend public/landing chrome, i18n, policies, a11y toolkit, contact/sitemap, forms. This is a prototype — not a STQC-certified production portal.

---

## Summary verdict

| Area | Status (25 Jul) | Change vs 23 Jul |
|------|----------------|-----------------|
| Gov branding & identity | Strong | Unchanged |
| Bilingual EN / Assamese chrome | Strong (draft quality) | Improved — key parity complete |
| Basic accessibility (skip, font size, focus) | Strong | Unchanged |
| UX4G accessibility bar + widget | Loaded & wired | **Fixed** (was unwired) |
| Public pages (About, Services, Contact, Sitemap) | Present | Unchanged |
| Full GIGW policy suite | Weak | Unchanged |
| Accessibility statement / screen-reader page | Missing | Unchanged |
| Feedback form | Missing | Unchanged |
| Security audit readiness (CAPTCHA, real OTP, audit cert) | Weak | Unchanged |
| Public search + XML sitemap | Weak / missing | Unchanged |

**Bottom line:** Frontend GIGW scaffolding is stronger than mid-July — the official UX4G toolkit is live. Still not compliance-complete for GIGW 3.0 / STQC CQW. Content, policies, feedback, and discoverability remain the main gaps.

---

## Frontend-only score (25 Jul 2026)

These percentages are an **internal estimate** for UI/chrome the frontend team controls. They are **not** an official STQC / GIGW certification score.

| Pillar | Score | Rationale |
|--------|------:|-----------|
| Identity (branding / ownership) | **88%** | TCP / Assam / NIC / Digital India logos, ownership lines, partner carousel |
| Accessibility toolkit | **72%** | UX4G bar + widget, skip-to-content, font size, focus-visible, reduced motion; no statement page; skip-to-nav unused |
| Content / compliance pages | **52%** | Core public pages exist; policies thin; no feedback / accessibility statement; resources stub |
| Bilingual | **82%** | Switcher + `html lang` + EN/AS key parity; Assamese still marked draft for review |
| Discoverability | **38%** | HTML sitemap yes; no `sitemap.xml`, no public search, no `robots.txt` |
| **Overall (frontend)** | **~66 / 100** | Weighted blend of the five |

### Four GIGW pillars (prototype)

| Pillar | Rough status | Comment |
|--------|--------------|---------|
| Quality | Partial (~60%) | Branding & IA good; policies / search / feedback incomplete |
| Accessibility | Partial (~70%) | Toolkit largely wired; statement & full AA content incomplete |
| Cybersecurity | Early (~35%) | Prototype auth; CAPTCHA / audit / hardened controls pending |
| Lifecycle | Early (~30%) | Ownership noted; WIM / WQM / monitoring dashboard pending |

---

## What we have right

### Government identity
- Assam / Housing & Urban Affairs / Directorate of Town & Country Planning branding  
- TCP logo in navigation and chrome  
- NIC and Digital India logos; partner carousel (India.gov.in, MyGov, etc.)  
- Footer ownership attributed to Directorate of TCP, Assam  
- Note: National Emblem of India is not the primary mark (TCP logo used)

### Language
- English + Assamese switcher in the UX4G accessibility topbar  
- Message catalogs: `frontend/src/i18n/messages/en.js`, `as.js`, plus public-page catalogs  
- Key parity across EN/AS catalogs (landing / auth / workspace + public pages)  
- `<html lang>` updated with language choice (`en` / `as`)  
- Assamese still labeled draft for review (quality, not coverage)

### Accessibility toolkit (updated)
- Official UX4G CDN loaded in `frontend/index.html` (`accessibility-bar.css` + `accessibility-widget.js`)  
- Slim GoI-style topbar: `Ux4gTopbar.jsx` + `styles/ux4g-topbar.css`  
- Skip to content (`App.jsx`, `skipNavigation.js`)  
- Font size controls A− / A / A+ with persistence  
- Widespread `:focus-visible` styles  
- ARIA on toolbars, modals, FAQ, OTP, loaders  
- `prefers-reduced-motion` / Framer reduced-motion handling  
- High-contrast expected via **UX4G widget**; portal-owned `body.a11y-contrast-high` CSS still exists but is not toggled from React

### Public information architecture
- Home / login landing  
- About, Services, Contact (helpdesk), Sitemap  
- Policies entry point (`/policies`) — Terms + Privacy only  
- Resources / Documents route exists (coming-soon placeholder)  
- Need-support CTA → contact  
- Last updated + copyright in footer (`siteMeta.js`) — dates need alignment

### Responsive & forms foundation
- Mobile landing nav / drawer  
- Auth and service forms with labels and alert-style errors  
- OTP input with keyboard / paste / `inputMode="numeric"` / `autoComplete="one-time-code"`

### Related code / docs
- `docs/accessibility-ux4g-plan.md` — UX4G / GIGW intent (Phases 1–2 largely reflected in code)  
- Landing footer & sitemap link sets  

---

## Where we are lacking

### P0 — blockers for a GIGW / STQC path

| Gap | Notes |
|-----|--------|
| Accessibility Statement | No dedicated Screen Reader Access / Accessibility Statement page or footer/topbar link |
| Full policy suite | Only thin Terms + Privacy. Still needed: Copyright, Hyperlinking, Content Contribution / Moderation, Contingency Management, Security policy, Website / WIM policy (local, not only india.gov.in link) |
| Feedback mechanism | No `/feedback` page or form; contact is largely mailto / tel |
| CAPTCHA / bot protection | None on public auth or contact surfaces |
| Security audit readiness | Demo OTP, no CERT-In / STQC audit clearance for production |

### P1 — should strengthen soon

| Gap | Notes |
|-----|--------|
| Assamese quality review | Catalog parity done; content still draft for linguistic/legal review |
| Skip to navigation | Helper exists in `skipNavigation.js`; skip-to-nav link not rendered |
| Public site search | Workspace search only |
| XML sitemap | HTML sitemap yes; no `sitemap.xml` / `robots.txt` |
| Consistent last-updated | Footer dates conflict (`siteMeta.js` vs hardcoded line) |
| Accessible PDF publishing | Upload accepts PDF; no tagged-PDF / a11y publishing guidance |
| Dead a11y CSS cleanup | Leftover `.ux4g-a11y-*` / unused portal contrast toggle paths |
| Resources downloads | Route present; content still “coming soon” |
| National Emblem presentation | TCP logo used; Emblem of India not used as primary mark |
| Metadata depth | Page titles / keywords / per-page review ownership uneven |

### P2 — later / go-live integrations

| Gap | Notes |
|-----|--------|
| `.gov.in` / `.nic.in` hosting & domain norms | Prototype environment |
| API links (DigiLocker, India Portal, SSO, MyGov, Data platform) | Not in current scope |
| Website Quality Manual (WQM) + CQW process | Organisational / process, not only code |
| Appointed Web Information Manager (WIM) | Process requirement |

---

## Suggested fix backlog

### Phase A — content & policy (department + content)
1. Expand `/policies` (or split pages) for full GIGW policy set, approved by WIM  
2. Add Accessibility Statement + Screen Reader Access page; link from a11y bar and footer  
3. Add Feedback page/form; wire footer + sitemap  
4. Align last-updated dates and ownership lines sitewide  

### Phase B — accessibility toolkit (mostly done; finish edges)
1. Confirm UX4G widget contrast / text spacing / TTS in QA on landing + dashboard  
2. Add skip-to-navigation link (helper already exists)  
3. Wire or retire `body.a11y-contrast-high` and dead `.ux4g-a11y-*` CSS  
4. Accessibility statement checklist mapped to WCAG 2.1 AA  
5. Assamese linguistic review for public chrome  

### Phase C — security & quality for production
1. Replace demo OTP; secure session / CSRF already reviewed for go-live  
2. CAPTCHA or equivalent bot protection on public forms  
3. CERT-In empanelled / NIC / STQC security audit before production  
4. Public search + `sitemap.xml` (+ `robots.txt`)  
5. Accessible PDF standards for published certificates / notices  

---

## Changelog (this refresh)

| Item | 23 Jul | 25 Jul |
|------|--------|--------|
| UX4G CDN + topbar | Not loaded | Loaded (`index.html` + `Ux4gTopbar.jsx`) |
| Custom purple a11y FAB | Present / conflicting | Removed from React (CSS leftovers remain) |
| EN/AS catalog parity | Partial | Parity across main + public catalogs |
| Frontend-only overall score | ~45–55% (informal) | **~66 / 100** |
| Statement / policies / feedback / CAPTCHA / XML sitemap | Missing | Still missing |

---

## Notes

- Treat `docs/accessibility-ux4g-plan.md` and demo credentials docs as **intent**, not proof of live compliance.  
- Re-run this checklist after each Phase A–C delivery and before any STQC CQW application.  
- For the official conformity checklist, use [Annexure II](https://guidelines.india.gov.in/annexure-ii-matrix-to-check-conformity/).  
- Do not treat the UX4G widget alone as full GIGW certification.
