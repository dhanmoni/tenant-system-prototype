# Statutory Forms Engine — implementation plan

Status: **plan only, no code written yet.** Nothing in `app/` or `frontend/src/` has been changed.

The brief this work started from was drafted by an AI assistant and is not authoritative. Statutory
facts here come from the Gazette documents directly — see [gazette-divergences.md](gazette-divergences.md).

Branch at time of writing: `staging` @ `c21d0c2`.

---

## Part 1 — What the repo is today

### Stack

| Concern | What is actually here |
|---|---|
| Backend | Laravel **12.69.1** on PHP 8.2.12, Sanctum auth, `barryvdh/laravel-dompdf` + FPDI for PDF |
| Frontend | React **19.2** + Vite 7, React Router 6, **@tanstack/react-query 5**, Tailwind 4, plain CSS classes (`ws-*`, `tenancy-*`) |
| DB | MySQL via Eloquent migrations, `SoftDeletes` on every application table |
| Validation | Laravel `$request->validate([...])` inline in each controller. **No schema/validation library on either side** — the frontend does `required` attributes and nothing more |
| i18n | Home-grown: `src/i18n/LanguageContext.jsx` + `messages/en.js` / `as.js`, consumed as `const { t } = useLanguage()`, keys like `ws.app.rentRevision`. No i18n library |
| Tests | PHPUnit 11 configured, but `tests/` holds **only the two stock `ExampleTest.php` files**. Frontend has **no test runner at all** |
| Legal citations | Only a display string: `rule: 'Rule 5(1)'` on each entry in `src/data/tenantServices.js`. No provision model, no IDs, no linking |

### The eight forms today

Each form is one React panel → one API route → one controller → one table → one model.

| Form | Panel (`frontend/src/components/`) | Controller | Table | Model |
|---|---|---|---|---|
| I | `FormIRentRevisionPanel.jsx` | `RentRevisionApplicationController` | `rent_authority_form_i_applications` | `RentRevisionApplication` |
| I-A | `FormIARentRevisionPanel.jsx` | `OtherChargesRevisionApplicationController` | `rent_authority_form_ia_applications` | `OtherChargesRevisionApplication` |
| I-B | `FormIBValuerAppointmentPanel.jsx` | `ValuerAppointmentApplicationController` | `rent_authority_form_ib_applications` | `ValuerAppointmentApplication` |
| II | `Form4RentCourtPossessionPanel.jsx` | `RentCourtPossessionApplicationController` | `rent_court_form_4_applications` | `RentCourtPossessionApplication` |
| III | `Form5RentCourtFilingPanel.jsx` | `RentCourtFilingApplicationController` | `rent_court_form_5_applications` | `RentCourtFilingApplication` |
| IV | `Form6RentAuthorityFilingPanel.jsx` | `RentAuthorityFilingApplicationController` | `rent_authority_form_6_applications` | `RentAuthorityFilingApplication` |
| V | `Form7RentCourtAppealPanel.jsx` | `RentCourtAppealApplicationController` | `rent_court_form_7_applications` | `RentCourtAppealApplication` |
| VI | `Form8RentTribunalAppealPanel.jsx` | `RentTribunalAppealApplicationController` | `rent_tribunal_form_8_applications` | `RentTribunalAppealApplication` |

Note the **naming skew**: panels and tables use the old numbering (4–8) while the type constants,
labels and routes use roman numerals (`form-ii-rent-court-possession`). Renaming is out of scope;
the plan keeps existing file and table names and introduces the engine alongside them.

Routing: `src/pages/dashboard/FormPortal.jsx` lazy-loads a panel from a `formType` route param via
the `formPanelLoaders` map, wrapped in `ServiceFormShell`. That indirection is exactly the seam the
engine needs — one generic panel can replace all eight entries without touching routing.

Shared plumbing that already exists and should be reused, not replaced:
`forms/TenancyUinLookup.jsx`, `forms/ServiceFormPreviewModal.jsx`, `forms/ServiceFormSection.jsx`,
`hooks/useServiceFormPreview.js`, `utils/serviceFormPreview.js` (`previewSection`/`previewItem`),
`utils/serviceFormSubmit.js`, `utils/buildServiceFormDocument.js` (printed output),
`utils/tenancyUinAutofill.js`, `constants/application.js`, `data/tenantServices.js`.

### Current shape of a saved filing

Flat columns, all `text`/`string`, e.g. `rent_court_form_4_applications`:

```
application_no, user_id, district_id, before_rent_court,
applicant_name, applicant_residential_address, tenancy_uin, tenant_name,
jurisdiction_statement, facts_of_case, grounds_for_relief,
matters_not_previously_filed, relief_sought, interim_order_sought, enclosures_list,
signature_name, signature_image_path,
status, assigned_to_role, forwarded_at/by, rejected_at/by, rejection_message,
approved_at/by, approval_message, forward_remarks, edit_history (json), timestamps, deleted_at
```

Every substantive field is `nullable text`. `enclosures_list` is a **textarea of prose** — there is
no file storage for enclosures anywhere on these eight forms. `DocumentUploadSlot.jsx` exists but is
used only by the tenancy-certificate and join flows. The only file any service form accepts is
`signature_image`.

In `Form4RentCourtPossessionPanel.jsx` the jurisdiction
declaration is collected as
`<textarea value={jurisdictionStatement} …>` labelled "Jurisdiction of the Rent Court (optional)",
and the verification paragraph ranges were four free-text inputs
(`verificationParasFrom/To`, `verificationBeliefParasFrom/To`) that were **collected in the UI and
then never sent to the server** — `submit()` did not append them to the `FormData`. Same for
`verificationDate`, `verificationPlace`, `verificationAge`, `verificationRelation`,
`verificationRelativeName`, `verificationAddress`.

**Fixed, 7 September 2026.** See §3.10. The ten loose fields are gone; the clause is one object,
rendered as the sentence the Gazette prints, and it reaches the server.

### UID prefill path

`TenancyUinLookup` → `GET /api/tenancy-applications/lookup-by-uin?uid=…` →
`TenancyApplicationController::lookupByUid()` → `serializeTenancyForAutofill()` →
`applyTenancyAutofill(formType, tenancy, user, setters)` fans the record into per-form `useState`
setters. Prefilled values land in ordinary editable inputs; nothing records that a value came from
the record, and nothing detects the filer overwriting it.

**Security finding — rule 4(4). Closed, 7 September 2026.** `lookupByUid` authorised on
`if (!$user)` — *any* authenticated user who could guess or obtain a UIN got landlord name, tenant
name, both addresses, premises description, rent and district. There was no party-membership check,
no rate limit, no audit entry, and `resolveForServiceForm` distinguished "not found" from
"cancelled" / "withdrawn" / "not issued" in the response body, which was an enumeration oracle.

What now stands in its place: `App\Support\TenancyAccess::isConcernedParty()` is the single gate,
`resolveForServiceForm(string $uid, ?User $actor)` calls it before any status check, an unknown UIN
and somebody else's UIN return the identical string and the identical 404, the route carries
`throttle:uin-lookup` (10/min), and every attempt is written to `user_activity_logs` with the UIN
and one of `disclosed` / `refused` / `not_usable`. The same gate now also guards service-form
submission, which had the same hole: all eight form controllers pass the filer through it.

Still open from this workstream, both tracked in §3.8: OTP (rule 4(5)) and read-only rendering of
prefilled values.

`GET /api/tenancy-applications/{no}/receipt` and `…/application-details` were the same rule 4(4)
breach by a different door — declared above the auth group, they returned the full tenancy to an
unauthenticated caller. **Closed 8 September 2026.** Both were moved inside the `auth:sanctum` group
and now share a single guard with the acknowledgement and the agreement:
`TenancyApplicationController::guardTenancyDocument()` resolves the account, applies
`userCanAccess()`, and records the read in `user_activity_logs` as `disclosed` or `refused`. Four
copies of the same check were what let two of them drift out from behind auth, so there is now one.

Two notes on the earlier reading of this item. The fix was expected to need signed URLs because the
documents were thought to be opened by `window.open` on a bare URL; they are not — all three call
sites (`TenancyCertificate.jsx`, `JoinApplication.jsx`, `AdminApplicationDetails.jsx`) fetch through
the authenticated axios client and write the returned HTML into a blank window, so the frontend
needed no change at all. `receipt` turned out to have no caller anywhere in the repo; it is kept and
guarded rather than deleted. Separately, `Authenticate::redirectTo()` still returned
`route('login')`, and this application has no `login` route — a browser pointed straight at one of
these URLs would have raised RouteNotFoundException and got a 500 instead of a 401. It now returns
null, so every unauthenticated request fails as 401 whatever it asked for.

A second limb had to be added alongside `userCanAccess()`. Its staff test turns on `office_id`,
while `ApplicationWorkflowController::show()` — the screen the print buttons sit on — tests district.
An officer could therefore open a file and be refused when they pressed Print. `officeHolderCanAccess()`
applies the workflow controller's own test so the two agree; the Valuer is excluded, as it is there.

Two residual defects were left open at the time; both were closed on 8 September 2026, below.

### Uploaded files — closed 8 September 2026

The same rule 4(4) breach through a third door, and the worst of the three. Every file a filer
uploads went to the `public` disk: both parties' passport photographs, their signatures, their PAN
cards, the executed tenancy agreement, and the signature on each of the eight service forms. That
disk is symlinked into `public/storage` and served by the web server to anybody, and the API handed
the paths out (`landlord_pan_url`, `agreement_pdf_path`) for the SPA to build
`<img src="{API}/storage/{path}">` from. Once a URL had been seen it worked for ever, signed in or
not. 447 files were exposed in the development database alone.

Uploads now go to a private `documents` disk with no `url` and no symlink, and leave only through
`GET /api/documents/{scope}/{id}/{field}` — `signed` middleware, expiring within the hour, minted by
`App\Support\DocumentStore` beside a record the caller has already been authorised to read. The URL
names a scope, a record id and a **column from a fixed registry**, never the stored path, so a
signed URL cannot be edited into a request for a column that holds something other than a file.

Signed URLs rather than an authenticated route because these files are consumed by `<img src>` and
`window.open`, neither of which carries a bearer token, and the SPA and API are on different origins
in this deployment (`SESSION_SAME_SITE`), so a session cookie is not reliably sent on a subresource
request either. A signed URL is a capability issued to somebody who has just passed the record's own
access check; the thing it replaces was a public address.

Two smaller things fell out of it. `Authenticate::redirectTo()` was returning `route('login')` in an
application with no `login` route; it now returns null, so an unauthenticated request fails as 401
rather than 500. And `ApplicationWorkflowController`'s private type→model map moved to
`ApplicationTypes::modelFor()`, because the document registry needs the same map and a second copy
would fail silently as a 404 on a document that exists.

**Deployment step:** `php artisan documents:secure` must run on every environment. `DocumentStore`
reads through to the old disk so nothing breaks before it runs, but the existing files stay
world-readable until it does.

### Application-number enumeration — closed 8 September 2026

Every route under `/api/tenancy-applications/{applicationNo}` answered **403** for a real record the
account may not see and **404** for a number that was never issued. Application numbers run
`APP-YYYYMM-NNNNNN`, so walking the sequence told any signed-in account which applications had been
filed and in which month, without reading one of them. That is the enumeration Rule 4(4) forbids,
and `TenancyAccess::NOT_AVAILABLE` had already applied the opposite reasoning to UIN lookup.

Both cases now answer 404 with `TenancyAccess::APPLICATION_NOT_AVAILABLE`. Two halves had to agree:
`TenancyApplicationController::tenancyNotAvailable()` for the controller's refusal, and a
`renderable` in `App\Exceptions\Handler` giving route-model binding the identical body — binding
raises its own 404 before any controller runs, so without that half the router itself stayed the
oracle. The rewrite is scoped to `api/tenancy-applications/*`; a 404 elsewhere discloses nothing
about a tenancy.

`cancel()` keeps two gates rather than one. "You may not see this at all" and "you may see it but
only the landlord may cancel it" are different answers to different people, and collapsing them
would tell a tenant their own tenancy does not exist. `lookupByRefCode` keeps its explanatory
refusals too: a ref code is hash-derived rather than sequential, so it is not cheaply enumerable,
and the joining party needs to be told why they were turned away.

While fixing this, the 401-that-was-a-500 turned out **not** to have been fixed by the earlier
change. Overriding `Authenticate::redirectTo()` to return null is not enough — Laravel's own handler
ends with `redirect()->guest($exception->redirectTo($request) ?? route('login'))`, so null is
precisely what triggers the `route('login')` fallback. `App\Exceptions\Handler::unauthenticated()`
now returns 401 unconditionally, and `tests/Feature/TenancyEnumerationTest.php` asserts it for an
`Accept: text/html` request — the case a typed-in document URL actually produces.

### The office_id limb — closed 8 September 2026

`userCanAccess()` returned true for any account whose `office_id` matched the tenancy's, without
looking at the role. No citizen has an `office_id` — only `UserManagementController` sets one, and
registration does not — but nothing stopped an administrator creating a `user`-role account with
one, and that account would then have read every tenancy filed at that office. The limb now also
requires an office-holding role through `isOfficeHolderRole()`, which is the single definition
`officeHolderCanAccess()` uses as well. The Valuer is excluded from it, as it is in
`ApplicationWorkflowController`.

### Hearing pipeline (out of scope)

`CaseProceeding` (polymorphic `application_type` + `application_id`, `notice_type`, `hearing_date`,
`venue`, `remarks`) plus `components/dashboard/notice-templates/*.jsx` is the existing notice/hearing
layer. The engine produces inputs to it and must not alter it. The polymorphic
`application_type`/`application_id` pair is the established repo convention for cross-form
attachments and is reused for enclosures, attestations and clocks.

---

## Part 2 — Statutory position

The task description this work started from was itself drafted by an AI assistant, so it is **not
authoritative**. Every statutory fact used here was re-derived from the two Gazette documents
directly: both PDFs are photographs of printed pages with no text layer, so all 48 pages were
rendered and read, and the provisions were transcribed from the page images.

Where the Act and the Rules disagree with each other, or with the forms printed alongside them, the
findings are recorded in **[gazette-divergences.md](gazette-divergences.md)** — nine items, four of
which need a decision before the affected work starts:

| Ref | Issue | Status |
|---|---|---|
| A1 | Form VI's limitation paragraph cites Act s. 38(1); the appeal is created by s. 37(1) | handled |
| A2 | Form II has no respondent block and designates no service address | handled |
| B1 | Tribunal disposal: Act s. 37(2) 60 days vs rule 13(8) 120 days | **decided: 60 days** |
| B2 | Adjournments: Act s. 35(6) three vs rule 13(8) one "ordinarily" | **open** |
| C1 | Act s. 35(2) 60 days from receipt vs s. 35(7)/(8) 90/30 days from filing | **open** |
| C2 | Rule 10 routes Form III to s. 27(1) (vacant land); Form III is printed generically | **open, blocks Form III** |
| D1 | Act s. 19(2) remedy has no prescribed form | **open, blocks nothing** |
| D2 | Rule 5(4) requires a Government-recognised valuer; no register prescribed | handled |
| E1 | Typesetting slips in Forms I-A, II, IV, VI | handled |

Governing principle where the two instruments conflict: **the Act wins**, since a rule made under
s. 44 cannot enlarge what the Act provides.

Two things follow for the design, both already reflected in Part 3:

- Forms I–VI exist **only** in the Schedule to the Rules. The Act carries only its own First and
  Second Schedules. So form wording, paragraph numbering and the bracketed declarations must all come
  from the Rules — the Act cannot supply them.
- Printed labels and bracket text are held **per form**, never shared. Form IV's para 1 is
  "Particulars of violation against which the present application is made", its second party is the
  "Opposite Party", and its jurisdiction declaration names the Rent Authority; Form II's party bracket
  omits the service-of-notices wording the others carry. The paragraph *skeleton* is genuinely shared
  across Forms II–VI; the *text* is not.

## Part 3 — Design, mapped onto this repo's conventions

Guiding rule: **PHP is canonical, React renders.** The definitions must drive server-side validation
(a client-only definition is bypassable), and the repo already validates in controllers. So form
definitions live in PHP and are served to React, which caches them with the React Query already in
use.

### 3.1 Provisions registry (§3.1)

DB-backed, because `effectiveFrom`/`effectiveTo` versioning and the `provisionVersionId` snapshot on
each filing need real rows with stable ids.

- Migration `create_provisions_table`: `id` (string PK, e.g. `ATA2021.s21.2.b`), `version_id`
  (autoinc surrogate — what filings snapshot), `instrument` enum `ACT_2021|RULES_2025`, `section`,
  `subsection`, `clause`, `marginal_heading`, `text` (nullable), `effective_from`, `effective_to`,
  `superseded_by`, timestamps.
- `app/Models/Provision.php` with `scopeInForceOn($date)`; id parser/formatter in
  `app/Support/ProvisionId.php` enforcing `INSTRUMENT.sN[.subN[.clause]]`.
- `database/seeders/ProvisionSeeder.php` seeds every provision the forms and clocks reference. Because I read
  the Gazette pages directly rather than trusting OCR, `text` is populated verbatim for: Act ss. 8,
  9, 10, 11, 12, 13, 14, 15, 17, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
  36, 37, 38, 39, 40(1), First Schedule, Second Schedule; Rules 2–15 and all eight Forms.
  `TODO(legal-text)` remains only for provisions I did not read (Act ss. 3–6, 16, 18, 40(2)–44 and
  s. 2 clauses (m) onward).
- `GET /api/provisions/{id}` returns one provision for the inline drawer. Never bulk-dump the Act.
- Frontend: `<ProvisionCite id="ATA2021.s21.2.b" />` renders the citation and opens a drawer,
  replacing the `rule: 'Rule 5(1)'` display strings in `data/tenantServices.js`.

### 3.2 Form definitions (§3.2, §3.3)

- `app/Forms/FormDefinition.php`, `app/Forms/Field.php`, enums `BracketOrigin`, `FieldType`,
  `Forum` under `app/Forms/Enums/` (matching the existing `app/Constants/` style but as PHP 8.1
  enums, which this codebase can use and `ApplicationTypes`/`Roles` predate).
- One file per form under `app/Forms/Definitions/` — `FormI.php` … `FormVI.php` — each returning a
  `FormDefinition`. Forms II–VI compose a shared `SharedAdversarialParagraphs::for($formId)` helper
  that supplies the paragraph **skeleton** while each form passes its own `printedLabel` and
  `bracketText` (see correction 9).
- `app/Forms/FormRegistry.php` maps `ApplicationTypes::*` → definition. `GET /api/form-definitions/
  {applicationType}` serves it; React Query caches it with a long `staleTime`.
- Field ids are namespaced by form, e.g. `form_ii.para_5_prior_proceedings`.

### 3.3 Validation — derive, don't duplicate

`app/Forms/FormDefinitionValidator.php` turns a `FormDefinition` into a Laravel rules array, so the
controller keeps its familiar `$request->validate($rules)` shape but the rules come from the same
object the UI rendered. No new validation library on either side; the frontend gets a small
`validateAgainstDefinition()` mirror for pre-submit feedback only, with the server authoritative.

### 3.4 The renderer

`frontend/src/components/forms/StatutoryForm.jsx` — one component, driven by the fetched definition,
plus `frontend/src/components/forms/fields/` with one component per field type:
`TextField`, `TextAreaField`, `ParagraphListField`, `AttestationField`, `ConditionalDeclarationField`,
`GroundSelectField`, `ProvisionSelectField`, `ForumSelectField`, `PartyField`, `MoneyField`,
`DateField`, `EnclosureListField`, `VerificationField`.

Bracket rendering is decided in exactly one place, `fields/BracketText.jsx`:

| `bracketOrigin` | Rendering |
|---|---|
| `rule_citation` | static caption under the title, wrapping `<ProvisionCite>` |
| `guidance` | persistent `<p class="field-guidance">` **below the label, above the control** — never a `placeholder` |
| `declaration` | `<AttestationField>` — required checkbox showing the bracket text verbatim |
| `conditional_declaration` | `<ConditionalDeclarationField>` — Yes/No, and on Yes a repeatable sub-form + mandatory enclosure |

`FormPortal.jsx`'s `formPanelLoaders` map collapses to the single `StatutoryForm`, keeping the route
contract. The eight old panels stay on disk until the legacy renderer work (§10.2) is done, then are
deleted in a follow-up.

### 3.5 Persistence and migration (§10)

Additive only. Per form table: `+ schema_version` (default 1; engine writes 2), and typed JSON
columns alongside the existing text ones — never dropping or rewriting a column. Plus four new
shared tables, all polymorphic on `application_type`/`application_id` to match `case_proceedings`:

- `filing_field_values` — typed value per `field_id`, with `prefill_source`, `record_value`,
  `asserted_value`, `differs_reason` (§8's escape hatch).
- `filing_attestations` — `field_id`, `accepted`, `text_snapshot`, `provision_version_ids` (json),
  `accepted_at`, `accepted_by`, `ip_address` (§5). Never a bare boolean.
- `filing_enclosures` — real file storage, which does not exist today: `label`, `path`, `mime`,
  `size`, `kind` (`AFFIDAVIT|CERTIFIED_COPY|PRIOR_PROCEEDING|OTHER`), `auto_appended`.
- `filing_paragraphs` — `field_id`, `ordinal`, `body`, `knowledge_tag`
  (`PERSONAL_KNOWLEDGE|LEGAL_ADVICE`), feeding §6.

Old filings keep `schema_version = 1` and render through `LegacyFilingView.jsx`, read-only.
`database/scripts/report_form_ii_grounds.php` is a **reporting** script only — it scans
`grounds_for_relief` free text on Form II filings, scores candidate s. 21(2) clause matches, and
writes a CSV of matches plus unmappable rows for manual triage. It never writes to the database.
Drafts: `tenancyDraft.js` holds localStorage drafts; drafts that cannot be mapped structurally get
flagged `requires_reentry` and the filer is notified — never silently discarded.

### 3.6 `StatutoryClock` (§7)

`app/Services/StatutoryClock.php` + `statutory_clocks` table (`provision_id`, `trigger_event`,
`trigger_date`, `duration_days`, `due_at`, `extension_provision_id`, `extended_to`,
`extension_reason`, `status`). Clock definitions in `app/Services/Clocks/ClockCatalogue.php`, keyed
by provision id, covering: rule 11(2) + proviso, s. 35(2), s. 35(7), s. 35(8), s. 32(2), s. 37(1),
s. 37(2) hearing + disposal, rule 13(8) (recorded as competing authority — see correction 3),
s. 38(3)/rule 14(2) execution, s. 20(3) one-month inquiry, s. 21(3) cure window.

Mixed-bucket Form II: apply the **shorter** clock, set `supervisory_review_required`, write the
rationale to the case log.

`app/Services/CalendarRules.php` is the single documented home for the calendar decision:
**calendar days, exclusive of the trigger day**, with holidays not yet modelled. Documented once
there, `// VERIFY:` at that one site, flagged for legal review rather than decided silently.

Adjournments: `adjournment_requests` table + counter per party per case, hard gate at three
(s. 35(6)), reasons-required override that also records the cost order. Note s. 35(6) binds the Rent
Authority too, not only the Court and Tribunal.

### 3.7 Interest rate (§4, rule 8)

`reference_rates` table (`key`, `value`, `effective_from`, `effective_to`, `source_note`,
`recorded_by`) + `app/Services/InterestRateResolver.php` resolving
`SBI_MCLR_HIGHEST` (+ 2 percentage points per rule 8(1)) as at a given date, with the rule 8(2)
fallback to `SBI_BENCHMARK_LENDING_RATE`, and honouring a contrary rate agreed in the tenancy
agreement. No numeric literal anywhere.

### 3.8 UID prefill and the lookup endpoint (§8) — Phase 1

- **Done.** `lookupByUid` has a party-membership gate: the caller must be the landlord, tenant or
  property manager on that tenancy record. Non-members get a uniform 404 regardless of whether the
  UIN exists, whether it is cancelled, or whether it is issued — killing the enumeration oracle.
  The second limb of rule 4(4), "the person authorized by Rent Authority", is deliberately not
  implemented: nothing records such an authorisation, so there is nothing to check against and the
  rule's closing words ("shall not be accessible to … any unauthorised person") make denial the
  safe default. Two consequences that need a representation model before they can be served — a
  deceased landlord's legal heirs (rule 7) and an authorised representative or legal practitioner
  (rule 9) cannot look a tenancy up under their own account.
- **Done.** `throttle:uin-lookup` on the route at 10/min; every lookup written to
  `UserActivityLog` with the UIN, caller and outcome. The generic activity middleware skips GET, so
  the endpoint logs itself.
- OTP: rule 4(5) contemplates OTP on registered mobile/e-mail. Nothing in the repo does OTP today,
  so this is a clearly marked integration point (`app/Services/Otp/OtpGateway.php` interface with a
  null implementation), not a half-built feature.
- Prefilled fields render read-only with an explicit "differs from record" control that captures
  both values plus a reason into `filing_field_values`. A form submission never writes back to
  `tenancy_applications`.

### 3.10 The VERIFICATION clause, Forms II to VI (§6) — done, 7 September 2026

The Gazette closes each of Forms II to VI with one sworn sentence carrying blanks. The portal had
shredded it into ten labelled boxes in a two-column grid, dropped the operative half, and sent none
of it to the server.

What now stands in its place:

- **Rendered as the sentence.** `forms/VerificationClause.jsx` splits `VERIFICATION_TEMPLATE` at its
  named placeholders and drops a control into each gap, so the filer reads the oath they are
  swearing. The prose is never written out in the component: on-screen wording and recorded wording
  cannot drift, and a renamed placeholder breaks loudly instead of rendering a wrong oath.
- **The operative clause is back.** "…and I hereby declare that I have not suppressed any material
  facts" was absent from the UI entirely. It is in the template, and a test asserts every form
  carries it.
- **Paragraph ranges are chosen, not computed by the filer.** Each assignable paragraph gets
  *personal knowledge* / *legal advice* / *not verified*, and the two blanks are derived. Paragraphs
  2 and 5 are excluded (sworn separately, under their own wording) and 8 is excluded (a list of
  enclosures asserts no fact), leaving 1, 3, 4, 6 and 7. At least one paragraph must be verified of
  personal knowledge, or the filing is refused.
- **Asked once.** The opening name and address mirror the applicant paragraph until the filer edits
  them. The date is stamped by the server, not typed — a typed date could be back-dated against the
  limitation paragraph of Forms V and VI.
- **Recorded like a declaration, with its blanks.** `filing_attestations` gained a `values` column;
  `AttestationRecorder` composes the snapshot through `Verification::compose()` from the server's
  own template. The client still never sends prose. The five form tables carry the same values plus
  `verification_statement`, so printing a filing needs no join.

Divergences F1 to F4 in [gazette-divergences.md](gazette-divergences.md) record where this cannot
reproduce the printed form exactly and why. Tests: `backend/tests/Unit/VerificationTest.php`, plus
the existing `DeclarationsTest` mirror check, which now walks the verification template too.

Forms I and I-A print no verification clause and keep their plain signature block.

**Form I-B, same treatment, 7 September 2026.** Form I-B has no numbered paragraphs and no
VERIFICATION clause, but its body is two sentences the applicant asserts, and both had the same
defect: the recital ("I, … Son/Daughter/Wife of … resident of …") was a grid of labelled boxes
with a `field-note` under the first one *explaining* that the form is written as a single sentence,
and the fee undertaking was display-only prose that reached the server nowhere.

Both now render through the same `ClauseSentence` splitter and both are recorded:
`FORM_IB_APPLICATION` composed by `App\Support\ValuerApplication`, `FORM_IB_UNDERTAKING` verbatim.
The undertaking deliberately has no tick-box — rule 5(4) puts the valuer's fee on "the aggrieved
party, who has filed the application", so the printed form gives no way to decline it and offering
one would imply a choice that does not exist. `applicant_relation_type` and
`applicant_landlord_or_tenant` also stopped accepting mixed-case duplicates
(`Son,son,Daughter,daughter,…`) and now take only the three and two alternatives the Gazette prints,
which is what lets the sentence render them without guessing at case.

**Profile prefill, 7 September 2026.** All eight forms now open with what the account already
knows, seeded at mount by `utils/profileAutofill.js` and every value editable:

| Where | From the profile |
|---|---|
| Forms II–VI | applicant / appellant name and address, signature name, and the verification's *aged* blank, computed from `date_of_birth` |
| Form I-B | name, resident-of, district, signature name, and landlord-or-tenant from `profile_type` |
| Forms I, I-A | the filer's own side only — both parties are named on these forms, so the other side stays blank |

Seeded through a lazy `useState` initialiser rather than an effect, so a value the filer has typed
is never overwritten afterwards. That is safe because `ProtectedRoute` blocks rendering until the
session user has resolved; if that gate is ever removed, these initialisers would capture an empty
profile and silently stop filling anything.

`ageOn()` returns '' rather than a guess for a missing, unparseable or implausible date of birth: an
age is part of a sworn sentence, so a blank the filer must fill beats a wrong number they might not
notice. Relation (S/o. / W/o. / D/o.) is deliberately **not** derived from `gender` — it is an
assertion about parentage or marriage, not something to infer.

Both clauses show a marked notice when anything was prefilled. A filer who does not realise a blank
was filled for them has not checked it, and it is the sentence they are swearing to.

`GET /api/user` now eager-loads `district:id,name`; it did not before, so the Form I-B district
blank would have stayed empty without it.

The shared pieces: `forms/ClauseSentence.jsx` splits any clause template at its placeholders and
throws if a placeholder has no control, `Declarations::fill()` does the same server-side and throws
if a blank is unfilled, and `AttestationRecorder` dispatches per clause to turn stored values into
the sentence's blanks.

---

### 3.11 Required / optional audit against the Gazette — done, 7 September 2026

The test the audit applied: an item printed **without** an "(if any)" marker is prescribed content,
and s. 35(5) requires an application or appeal to be "in such form as may be prescribed". Items
carrying "(if any)" — the Sub-Registrar document number, the property manager, paragraph 7's interim
order — are the only optional ones, plus enclosures, which s. 35(1)(a) makes "if any" except where a
rule says otherwise (rule 13(3), Form VI).

Twenty-three fields were marked wrongly, across all eight forms. Paragraphs 1, 3, 4 and 6 of Forms II–VI — the entire substance
of every application and appeal — were `nullable` on the server and unmarked in the browser, so a
filing could be submitted with nothing in it but a UIN and a signature. Fixed on both sides;
`tests/Unit/RequiredFieldsTest.php` now pins the split so it cannot drift back.

Paragraph 3 of Forms V and VI turned out not to be a field at all: like paragraphs 2 and 5, its
parenthetical **is** the answer ("The appellant further declares that the appeal is within the
limitation period prescribed in…"). It was a textarea with the declaration printed above it as a
hint. Converted to a `DeclarationCheckbox`, stored verbatim and attested.

**Open, and the most consequential thing the audit turned up:** rule 13(4) provides for an appeal
filed *after* limitation, accompanied by an application supported by an affidavit showing sufficient
cause. The printed form has no such branch — it prints only the declaration — so requiring that
declaration, which is what the form says, leaves a time-barred appellant with no way to file at all.
Paragraph 5 has exactly this shape already (negative declaration, or disclose and enclose), so
paragraph 3 should get the same branch. It needs enclosure storage first, because rule 13(4) calls
for an affidavit.

---

### 3.9 Multi-district (§ hard guardrail 4)

Verified against ss. 30, 33, 34: Rent Authority is a Circle-Officer-or-above appointed by the DC per
district; Rent Court is an ADC or equivalent per district; Rent Tribunal is a District Judge or
Additional District Judge **in each district**. The existing `districts` / `offices` tables already
carry this. `forumSelect` resolves District → forum from those tables. No district, forum or officer
name is hard-coded, in code or in seed data.

---

## Part 4 — Sequencing

| Phase | Content | Why here |
|---|---|---|
| 1 | UID lookup authorisation, rate limit, audit, uniform 404 — **done** (OTP and read-only prefill deferred) | Live data-exposure defect; independent of everything else |
| 2 | Provisions registry + seeder + `ProvisionCite` drawer; `docs/gazette-divergences.md` | Everything downstream references provision ids |
| 3 | Form definition classes, registry, API, `FormDefinitionValidator` | The contract both sides compile against |
| 4 | New tables + `schema_version` + legacy read-only renderer | Additive; must precede any write of typed data |
| 5 | `StatutoryForm` renderer + field components; Forms II–VI, then I/I-A/I-B | The visible refactor |
| 6 | `StatutoryClock`, `CalendarRules`, adjournment counter, `InterestRateResolver` | Needs structured grounds from phase 5 |
| 7 | Verification generator (§6) — **done**; attestation storage (§5) — **done**; enclosure rules — open | Depends on paragraph and enclosure tables |
| 8 | Migration reporting script, draft handling | Last, once the target shape is settled |
| 9 | Tests for every §11 criterion | Continuous, but the suite is completed here |

Tests: PHPUnit is configured but unused, so phase 9 also stands up the first real
`tests/Feature` + `tests/Unit` suites. The frontend has no test runner; adding Vitest is a small,
contained addition needed for the §11 criteria that are purely presentational ("no `declaration`
bracket is rendered as a textarea"). Flagging that as the one new dev dependency this plan
introduces — everything else reuses what is here.

---

## Part 5 — Open decisions

Carried in [gazette-divergences.md](gazette-divergences.md); repeated here because they gate work:

1. **B2 — Tribunal adjournment limit.** Warn after one and hard-gate at three, hard-gate at one with
   a reasons-required override, or a flat three everywhere? Suggested: the first.
2. **C1 — Act s. 35(2).** Track the sixty-day general target alongside the s. 35(7)/(8) deadlines?
   Suggested: yes, as an advisory target that prompts reasons once passed. Without it Forms III, V
   and VI have no monitoring at all.
3. **C2 — Form III scope.** Blocks Form III only. Suggested: Gazetted fields, s. 27(1) cited,
   vacant-land group declared but disabled.
4. **D1 — Act s. 19(2).** Blocks nothing; can be deferred.
5. **D3 — Rule 4(4)'s second limb.** Who records an authorisation, on what evidence, with what scope
   and what expiry? Nothing in the Act or the Rules prescribes a mechanism, and the rule 7 heir and
   the rule 9 representative are shut out of the platform until one exists. Blocks nothing else, but
   it is the one item where guessing is worse than waiting: a wrong verification standard hands
   tenancy details to non-parties, which is what Rule 4(4) exists to prevent. Proposed shape and the
   four open questions are in [gazette-divergences.md §D3](gazette-divergences.md).

Settled: **B1** — Tribunal disposal computed from Act s. 37(2) at 60 days, rule 13(8) recorded as a
competing authority. **Form IV affidavit** — enforced as a named, switchable portal policy
(`policy.form_iv.require_affidavit`, default on) rather than as a statutory rule, since rule 11(1)
and Act s. 35(1)(a) both say "if any". **Frontend tests** — Vitest + Testing Library.

Phases 1 to 4 (UID authorisation, provisions registry, form definitions, new tables) depend on none
of the open items and can start immediately.
