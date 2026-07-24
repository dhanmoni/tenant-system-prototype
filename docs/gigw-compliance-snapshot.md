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

**Date of review:** 23 Jul 2026  
**Scope:** Frontend public/landing chrome, i18n, policies, a11y toolkit, contact/sitemap, forms. This is a prototype — not a STQC-certified production portal.

---

## Summary verdict

| Area | Status |
|------|--------|
| Gov branding & identity | Strong |
| Bilingual EN / Assamese chrome | Strong (partial elsewhere) |
| Basic accessibility (skip, font size, focus) | Strong |
| Public pages (About, Services, Contact, Sitemap) | Present |
| Full GIGW policy suite | Weak |
| Accessibility statement / screen-reader page | Missing |
| High contrast / UX4G widget | Unwired / not loaded |
| Feedback form | Missing |
| Security audit readiness (CAPTCHA, real OTP, audit cert) | Weak |
| Public search + XML sitemap | Weak / missing |

**Bottom line:** Good GIGW-oriented scaffolding for a prototype. Not yet compliance-complete for GIGW 3.0 / STQC CQW.

---

## What we have right

### Government identity
- Assam / Housing & Urban Affairs / Directorate of Town & Country Planning branding
- TCP logo in accessibility bar and navigation
- NIC and Digital India logos; partner carousel (India.gov.in, MyGov, etc.)
- Footer ownership attributed to Directorate of TCP, Assam

### Language
- English + Assamese switcher in the accessibility bar
- Message catalogs: `frontend/src/i18n/messages/en.js`, `as.js`, plus public-page catalogs
- `<html lang>` updated with language choice

### Accessibility (partial)
- Skip to content link (`App.jsx`, `skipNavigation.js`)
- Font size controls A+ / A / A− with persistence
- Widespread `:focus-visible` styles
- ARIA on toolbars, modals, FAQ, OTP, loaders
- `prefers-reduced-motion` / Framer reduced-motion handling
- High-contrast CSS exists (`body.a11y-contrast-high`) — see gaps below

### Public information architecture
- Home / login landing
- About, Services, Contact (helpdesk), Sitemap
- Policies entry point (`/policies`)
- Need-support CTA → contact
- Last updated + copyright in footer (`siteMeta.js`)

### Responsive & forms foundation
- Mobile landing nav / drawer
- Auth and service forms with labels and alert-style errors
- OTP input with keyboard / paste / `inputMode="numeric"`

### Related code / docs
- `docs/accessibility-ux4g-plan.md` — UX4G / GIGW intent
- Landing footer & sitemap link sets

---

## Where we are lacking

### P0 — blockers for a GIGW / STQC path

| Gap | Notes |
|-----|--------|
| Full policy suite | Only thin Terms + Privacy. Still needed: Copyright, Hyperlinking, Content Contribution / Moderation, Contingency Management, Security policy, Website / WIM policy (local, not only india.gov.in link) |
| Accessibility Statement | No dedicated Screen Reader Access / Accessibility Statement page |
| High contrast not wired | CSS + i18n keys exist; no toggle in the accessibility bar |
| UX4G widget not loaded | Plan doc references CDN cutover; `index.html` does not load UX4G |
| Feedback mechanism | No `/feedback` page or form; contact is largely mailto |
| Security audit readiness | Demo OTP, no CAPTCHA / bot protection, no CERT-In / STQC audit clearance for production |

### P1 — should strengthen soon

| Gap | Notes |
|-----|--------|
| Assamese completeness | `as.js` marked draft; much workspace / admin UI still English-only |
| Skip to navigation | Helper exists; skip-to-nav link not rendered in App |
| Public site search | Workspace search only |
| XML sitemap | HTML sitemap yes; no `sitemap.xml` |
| Consistent last-updated | Footer / sitemap dates conflict |
| Accessible PDF publishing | Upload accepts PDF; no tagged-PDF / a11y publishing guidance |
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

### Phase B — accessibility toolkit
1. Wire high-contrast toggle to existing CSS  
2. Load and configure UX4G (or equivalent WCAG AA toolkit) per plan  
3. Add skip-to-navigation link  
4. Mobile access to font size / language (utility bar or nav drawer)  
5. Accessibility statement checklist mapped to WCAG 2.1 AA  

### Phase C — security & quality for production
1. Replace demo OTP; secure session / CSRF already reviewed for go-live  
2. CAPTCHA or equivalent bot protection on public forms  
3. CERT-In empanelled / NIC / STQC security audit before production  
4. Public search + `sitemap.xml`  
5. Accessible PDF standards for published certificates / notices  

---

## Scorecard (prototype)

| Pillar | Rough status | Comment |
|--------|--------------|---------|
| Quality | Partial | Branding & IA good; policies / search / feedback incomplete |
| Accessibility | Partial | Basics present; AA toolkit & statement incomplete |
| Cybersecurity | Early | Prototype auth; audit & hardened controls pending |
| Lifecycle | Early | Ownership noted; WIM / WQM / monitoring dashboard pending |

---

## Notes

- Treat `docs/accessibility-ux4g-plan.md` and demo credentials docs as **intent**, not proof of live compliance.  
- Re-run this checklist after each Phase A–C delivery and before any STQC CQW application.  
- For the official conformity checklist, use [Annexure II](https://guidelines.india.gov.in/annexure-ii-matrix-to-check-conformity/).
