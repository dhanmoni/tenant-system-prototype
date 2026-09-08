# Gazette divergences

Where the Assam Tenancy Act, 2021 and the Assam Tenancy Rules, 2025 disagree with each other, or with
the forms printed alongside them. Everything here is drawn from the two Gazette documents themselves.

Both source PDFs are photographs of printed pages with no text layer, so nothing below comes from
automated text extraction — all 48 pages were rendered and read directly, and every quotation was
transcribed from the page image. Full transcripts are held with the project working files.

**Not a legal opinion.** Items B1, B2, C1, C2 and D1 turn on how the Act and the Rules should be read
together, which needs confirmation by someone qualified. B1 and C2 have been decided; B2, C1 and D1
remain open.

## Sources

| | Instrument | Gazette | Date | Pages |
|---|---|---|---|---|
| Act | The Assam Tenancy Act, 2021 (Assam Act No. XXXI of 2021) | Extraordinary | 1 Oct 2021 | 2619–2646 |
| Rules | The Assam Tenancy Rules, 2025, made under Act s. 44 | Extraordinary No. 494, Dispur | 10 Jul 2025 (notified 9 Jul 2025) | 4173–4192 |

Forms I, I-A, I-B, II, III, IV, V and VI appear **only** in the Schedule to the Rules (pp. 4180–4192).
The Act carries only its own First Schedule (tenancy information form, p. 2645) and Second Schedule
(division of repair responsibility, p. 2646). The Rules are notified and in force, not a draft.

**Ordering principle:** where the Act and the Rules genuinely conflict, the Act governs — a rule made
under s. 44 cannot enlarge what the Act provides.

---

## A. Defects in the printed forms

### A1 — Form VI cites the wrong section for limitation

Form VI, paragraph 3 (Rules p. 4191), verbatim:

> (The appellant further declares that the appeal is within the limitation period prescribed in
> sub-section (1) of section 38 of the Assam Tenancy Act (Act No. XXXI of 2021)

Act s. 38 (p. 2641) is headed **Execution of order** — delivery of possession, attachment of bank
accounts, appointment of a person to effect execution. It creates no appeal and no limitation period.
The provision that creates the Tribunal appeal and fixes thirty days is **s. 37(1)** (p. 2640).
Rule 13(1) cites s. 37(1) correctly, so the slip is confined to the Schedule.

**Handling.** `provisions: ["ATA2021.s37.1"]` drives the deadline. `printedTextOverride` carries the
verbatim s. 38 wording so a printed form stays faithful to the Gazette, with a note in the admin view.
Never computed from s. 38; the printed text is never silently corrected.

### A2 — Form II has no respondent block

Form II (Rules p. 4183) names only `…APPLICANT`. Forms III–VI each carry `A. Name of the Applicant` /
`Versus` / `B. Name of the Respondent` (Form IV: `Opposite Party`), each with a service-address
instruction. In Form II the tenant appears only in the recital:

> Whereas the premises mentioned herein above was rent out to the Tenant Mr./Ms. [ ] S/o / DIO [ ]
> vide Unique Identification Number________________

Form II's applicant instruction is also shorter than the rest — *"(Add description and the residential
address of the Applicant)"* — omitting *"on which the service of notices is to be effected"*, which
Forms III–VI all carry. So Form II designates no service address at all.

This matters because rule 7 proceedings are contested and require notice on the tenant, and Act
s. 21(3) lets the tenant defeat a ground-(b) eviction by paying arrears within one month **from the
date of service of the demand notice**.

**Handling.** A structured respondent/tenant block with a validated service address is added at portal
level; printed output follows the Gazette layout.

### A3 — Form II prints three lines for grounds; section 21(2) lists eight

The recital reads: *"In accordance with sub-section (2) of section 21 or section 22 of the Act, I
hereby request the Rent Court for recovery of possession of the premises on following ground:"*,
followed by three ruled lines numbered (i), (ii) and (iii).

Act s. 21(2) empowers the Rent Court to make an order *"on one or more of the following grounds"* and
sets out **eight** clauses, (a) to (h). Section 22 is a separate basis with no sub-grounds — bonafide
requirement by the legal heirs of a deceased landlord.

The three lines are therefore a typographic convenience, not a statutory cap. Reading them as a
limit would bar a landlord from relying on a fourth ground the Act allows.

**Handling.** The portal captures the basis (s. 21(2) or s. 22) and, for s. 21(2), the clauses relied
on as a closed multi-select carrying the statutory text of each clause and the Explanations printed
under clauses (d) and (f). No cap of three is applied. Stored as `statutory_basis` plus an
`eviction_grounds` array on `rent_court_form_4_applications`, so the selection stays machine-readable
— which is also what the s. 35(7)/(8) disposal buckets will need if those clocks are built later.

### A4 — Form IV never asks which of four sections it is filed under

Rule 11(1): *"An application made to the Rent Authority under sections 10, 14, 15 and 20 of the Act
shall be made by the applicant in FORM - IV accompanied by affidavits and documents, if any."*

Four different proceedings therefore share one form, and what the Rent Authority does next differs
completely between them — s. 10 determines revised rent and its effective date; s. 14 handles a
deposit where the landlord refuses rent; s. 15 apportions repairs under the Second Schedule; s. 20
carries an interim restoration order, an inquiry to be completed within one month of filing,
compensation up to two months' rent, and a penalty up to twice the monthly rent for a frivolous or
vexatious application.

Form IV asks only for *"Particulars of violation against which the present application is made"*. It
never asks which section is invoked, so nothing in the filing tells the Authority which inquiry to
open.

**Handling.** The portal captures the section as a required closed choice of the four rule 11(1)
names, stored as `statutory_matter`. Two of them carry a statutory list of their own, captured with
it: for s. 15 the Second Schedule items in dispute (Part A landlord, Part B tenant), and for s. 20
the services withheld, from the Explanation to s. 20. That Explanation says *"includes"*, so the list
is illustrative and an "other" entry with free text is allowed. Section 19 is deliberately not
offered — see item D1.

### A5 — Paragraphs 2 and 5 are declarations, not questions

On Forms II to VI the parenthetical text under paragraph 2 (jurisdiction) and paragraph 5 (matters
not previously filed) is not guidance for the filer. It is the assertion being made. Paragraph 2 has
no free-text answer at all, and paragraph 5 is a negative declaration with an affirmative branch:

> (The applicant declares that the subject matter of this application is within the jurisdiction of
> the Rent Court.)

> (The applicant further declares that he/she had not previously filed any application, petition,
> writ petition or suit … In case the applicant has previously filed any such application, writ
> petition or suit, the details of the pendency of such cases filed, or if disposed, the decisions
> of such cases to be enclosed.)

**Handling.** Paragraph 2 is a required checkbox carrying the printed wording verbatim. Paragraph 5
is a yes/no: answering "no such proceeding" makes the declaration, answering "yes" means it is not
made and the particulars are required instead — case number, forum, filing date, status, and either
the pendency details or the decision. The decision in each disposed case is appended to the
paragraph 8 enclosure list, since the form requires it to be enclosed.

Accepted declarations are written to `filing_attestations` with a verbatim snapshot of the wording
displayed, the provisions relied on, and who accepted it, when and from where. A bare boolean would
not survive a later amendment to the wording. This matters because Act s. 36(2) deems proceedings
before the Rent Court and Rent Tribunal to be judicial proceedings within ss. 193 and 228, and for
the purposes of s. 196, of the Indian Penal Code.

The server takes the snapshot from its own constant and never from the request, so the recorded
wording cannot be forged by a crafted submission. The legacy free-text columns are retained and
populated with a readable rendering, so existing admin views and printed output are unaffected.

---

## B. Act / Rules conflicts

### B1 — Tribunal appeal disposal: 60 days (Act) vs 120 days (Rules) — **decided: 60 days**

| Source | Period | Trigger | Wording |
|---|---|---|---|
| Act s. 37(2) | **60 days** | date of service of notice of appeal on the respondent | "the appeal **shall** be disposed of within a period of sixty days from such date of service" |
| Rule 13(8) | 120 days | same | "the appeal **should** be decided within a period of one hundred twenty days from the date of service of notice of appeal on the respondent" |

**Handling.** Clock computed from `ATA2021.s37.2` at 60 days. `ATR2025.r13.8` stored on the clock row
as a competing authority and surfaced in the admin view. `// VERIFY:` at the clock definition.

### B2 — Adjournment limit for Tribunal appeals — **open**

- Act s. 35(6): the Rent Authority, Rent Court or Rent Tribunal "shall not allow more than **three**
  adjournments at the request of a party throughout the proceedings", and beyond that must record
  reasons in writing and may order costs.
- Rule 13(8): for Tribunal appeals, "not more than **one** adjournment shall **ordinarily** be given".

Not flatly contradictory — one is stricter than three, and "ordinarily" admits exceptions — but the
counter needs a number to gate on. Suggested: warn after the first, hard-gate at the third, leaving the
discretion "ordinarily" implies with the presiding officer.

---

## C. Inconsistencies inside a single document

### C1 — Act s. 35 gives one eviction case two deadlines — **open**

| Provision | Period | Trigger | Applies to |
|---|---|---|---|
| s. 35(2) | 60 days | date of **receipt** | every Rent Court / Tribunal matter; "shall endeavour", reasons recorded if exceeded |
| s. 35(7) | 90 days | date of **filing** | s. 21(2) clauses (a), (b), (e), (f), (g) or s. 22 |
| s. 35(8) | 30 days | date of **filing** | s. 21(2) clauses (c) and (d) |

An eviction on ground (a) therefore carries a 60-day general target *and* a 90-day specific deadline,
measured from two different starting points, with the general one shorter than the specific one. The
force differs too — "shall endeavour" in (2) against "shall be decided" in (7) and (8).

s. 35(2) also matters on its own: it reaches every Rent Court and Tribunal matter, so Forms III, V and
VI have a statutory deadline even though nothing specific to them names one.

Suggested: track s. 35(2) as an advisory target that prompts reasons once passed, with (7) and (8) as
the hard deadlines where they apply.

### C2 — Rule 10 and Form III describe different things — **decided: general form**

Rule 10: "Any application under **sub-section (1) of section 27** shall be made to the Rent Court by
the applicant in FORM-III."

Act s. 27 (p. 2635) is headed **"Special provision regarding vacant land"**: where let premises comprise
vacant land on which municipal bye-laws permit a building, and the landlord who intends to build cannot
obtain possession, the Rent Court may direct severance, place the landlord in possession of the vacant
land, and re-determine the rent on the remainder.

Form III, printed a few pages later in the same Rules, is titled generically ("Application filed before
the Rent Court") and collects none of the s. 27 particulars — no bye-law permissibility, intended
building, severance sought, or undue-hardship material. Its paragraphs are the same general ones as
Forms IV, V and VI.

Context: other Rent Court matters have no form of their own either — s. 26(2) (landlord's application to
build an additional structure), s. 25 (payment of rent during eviction proceedings) — which may be why
the form is titled broadly.

Options were: (a) Gazetted fields only, s. 27(1) cited as the enabling provision, vacant-land group
declared but disabled; (b) add the vacant-land fields now; (c) keep it fully generic and drop the
s. 27 link.

**Decision taken: (c).** Form III is treated as a general application before the Rent Court, matching
its printed title and the paragraphs the Gazette actually prints. No vacant-land fields are collected
and no s. 27(1) enabling citation is asserted on the form. Recorded here because rule 10 names only
s. 27(1), so a s. 27 application filed on Form III will not be distinguishable in the data from any
other Rent Court application.

---

## D. Gaps

### D1 — Act s. 19(2) has no prescribed form — **open**

Act s. 19(2) lets a landlord or tenant apply to the Rent Authority to remove a property manager who acts
against the landlord's instructions or in breach of duty, or to impose compensating costs. Act s. 31
confirms the Rent Authority holds Rent Court powers for s. 19 proceedings.

Rule 11(1) prescribes Form IV only for **ss. 10, 14, 15 and 20**. Section 19 is not listed, so the
remedy has no application form.

Options: accept s. 19 applications on Form IV; leave it out until the Rules are amended; or raise it with
the department. Nothing else in the build depends on it.

### D2 — no valuer register is prescribed

Rule 5(4) requires the valuer appointed on a Form I-B application to be "recognized by the Government".
Neither instrument says where that list is kept or who maintains it.

Rule 5(4) also settles two conditions the portal does not enforce today: Form I-B is available only to a
party who "does not agree with the rent or other charges fixed by the Rent Authority as provided in
sub-rule (3) of rule 5" — so it cannot be filed standalone — and the fee is borne by the aggrieved party
who filed it.

**Handling.** Valuer selection bound to a portal-maintained register rather than free text, and a parent
rule 5(3) order reference required before filing. Who may appear on that register is a departmental
matter.

### D3 — Rule 4(4)'s second limb has no mechanism — **open, and a decision is needed**

Rule 4(4) admits two classes of reader: the concerned Parties, and "the person authorized by Rent
Authority". Only the first is implemented. `App\Support\TenancyAccess::isConcernedParty()` answers
the first and denies everything else, because there is nothing in the system that records an
authorisation of the second kind, and Rule 4(4) closes by forbidding access to "any unauthorised
person" — so the safe reading is to deny until there is something to check against.

Two people are shut out by that, and both are people the Rules expect to act:

- **Rule 7** — on the death of a landlord, "the legal heirs of landlord may submit an application to
  the Rent Court" in Form II. An heir is not on the tenancy record, so they cannot look the tenancy
  up, and Form II needs the UIN.
- **Rule 9** — a party "may either appear in person or authorize in writing one or more
  representative or legal practitioner". That representative cannot see the tenancy under their own
  account.

**Why this is not simply a matter of building it.** Nothing in the Act or the Rules prescribes the
mechanism, and the two limbs do not even point at the same actor. Rule 9's authorisation is written
by *the party*, and it authorises representation "before the Rent Authority, Rent Court and Rent
Tribunal" — a right of audience in proceedings, not a grant of access to the digital platform.
Rule 4(4)'s authorisation is given by *the Rent Authority*. So a rule 9 representative is not
automatically a rule 4(4) authorised person; somebody at the Rent Authority still has to admit them.
Rule 7 says even less: the heirs file "along with relevant document and available evidence", and
that evidence goes to the **Rent Court** with the Form II application, not to the Rent Authority.
No form, no register and no verification standard is prescribed for either.

Every remaining question is therefore departmental, not technical:

1. Who records an authorisation — the Rent Authority of the district, or the Rent Court/Tribunal
   before which the representation is to be made?
2. What evidence is required? For rule 9, presumably the written authorisation itself, and a bar
   enrolment number where the representative is a legal practitioner. For rule 7 the Rules name
   nothing at all — a legal heir certificate, a succession certificate, and the death certificate
   are the obvious candidates, but that is an assumption, not a rule.
3. What does the authorisation reach — one tenancy, or every filing on it? Read-only, or may the
   representative file and sign? Rule 9 says "represent their case", which reads wider than reading.
4. How long does it last, and how is it revoked? A party who dismisses their advocate must be able
   to end it, and a representation granted for one proceeding should not outlive it.

**Recommended shape, if the department agrees it.** A `tenancy_representations` table
(`tenancy_application_id`, `representative_user_id`, `basis` = rule 7 | rule 9, evidence documents
through `DocumentStore`, `granted_by_user_id` = the Rent Authority officer, `scope`, `granted_at`,
`expires_at`, `revoked_at`), a request-and-approve flow on the officer side, and a second limb in
`TenancyAccess::isConcernedParty()` — or better, a sibling `isAuthorisedRepresentative()` so the two
limbs of Rule 4(4) stay visibly distinct in the code as they are in the rule.

**Not started deliberately.** Building it on assumed answers would hand tenancy details — including
the identity documents secured on 8 September 2026 — to people who are not parties, on a
verification standard nobody has approved. That is the precise failure Rule 4(4) exists to prevent,
and it is the one defect in this list where a wrong implementation is worse than no implementation.

---

## E. Typesetting slips in the Gazette

Reproduced rather than corrected: the bracketed text is what an applicant is shown and, for the
attestations, what they actually accept.

| Id | Form | As printed | Note |
|---|---|---|---|
| E1 | IV | jurisdiction bracket closes without a full stop | Forms II and III close the identical declaration with one |
| E2 | II | "S/o / **DIO** [ ]" | misprint of "D/o" |
| E3 | V, VI | VERIFICATION reads "(Name of the Applicant)" and signs off "Signature of the Applicant" | On two forms whose every other paragraph says *appellant*. The clause is printed identically on all five forms, so the appeal forms carry Form II's wording unchanged |
| E4 | VI | "…RESP" / "ONDENT DETAILS OF APPEAL:" | RESPONDENT split across a line break, running the party label into the next heading |
| E5 | I-A | item numbered "2" without a full stop | other items carry one |
| E6 | V, VI | paragraph 3's bracket is never closed | Each opens "(The appellant further declares…" and stops at "…(Act No XXXI of 2021)". Counting the parentheses, the outer bracket has no closing mate on either form, so the declaration ends on the inner citation |
| E7 | V vs VI | "Act No XXXI" against "Act No. XXXI" | the same Act cited two ways in the same clause on two forms |

**Handling.** `bracketText` stores the text verbatim, slips included. On-screen labels use corrected
spelling only where the slip would confuse a citizen ("D/o" for "DIO"); printed output unchanged.

---

## F. Deliberate divergences in this implementation

Places where the portal cannot reproduce the printed form exactly, and what it does instead. Unlike
sections A to E these are our choices, not the Gazette's, so each needs a reason.

| Id | Where | The printed form | What the portal does | Why |
|---|---|---|---|---|
| F1 | VERIFICATION, Forms II–VI | "the contents of paras …… to ……" — a contiguous range | Renders a range when the paragraphs are contiguous, otherwise a list ("paras 1, 4 and 6") | A filer may know paragraphs 1, 4 and 6 of their own knowledge and plead 3 on advice. Forcing that into a range would make them swear something untrue about the paragraphs in between |
| F2 | VERIFICATION, Forms II–VI | a blank for the legal-advice paragraphs | Writes "nil" when the filer marks none | Most filers act without a lawyer. Leaving a hole in a sworn sentence is worse than the word that would be written on the paper form |
| F3 | VERIFICATION, Forms II–VI | "Date:……….." as a blank the filer fills | Stamped by the server at submission and shown read-only | In an online filing the date of verification *is* the date of filing. A typed date could be back-dated against the limitation paragraph of Forms V and VI |
| F4 | VERIFICATION, Forms II–VI | one blank per paragraph range, filled by hand | The filer marks each paragraph *personal knowledge* / *legal advice* / *not verified*, and the two blanks are derived | Hand-computed ranges can be reversed, overlapping, or cite paragraph 9 of an eight-paragraph form, and nothing on paper catches it |

Paragraphs 2 and 5 are excluded from the F4 table: they are themselves sworn declarations, accepted
separately under their own wording, and sweeping them into "true to my personal knowledge" would
have the filer swear the same thing twice under two different formulas. Paragraph 8 is excluded
because a list of enclosures asserts no fact.

---

## Separate: a compliance gap, not a divergence

Rule 4(4): tenancy details "shall be accessible to concerned Parties only and to the person authorized
by Rent Authority. Under any circumstances, such information shall not be accessible to public or any
unauthorised person."

**Closed, 7 September 2026.** `TenancyApplicationController::lookupByUid` authorised on "is signed
in", not on party membership, and its distinct error messages allowed UIN enumeration. The gate is
now `App\Support\TenancyAccess::isConcernedParty()`, applied by
`TenancyApplication::resolveForServiceForm()` before any status check, so it covers form submission
as well as lookup. See [statutory-forms-engine-plan.md](statutory-forms-engine-plan.md).

**Closed, 8 September 2026.** `GET /api/tenancy-applications/{no}/receipt` and
`…/application-details` were declared above the auth group and rendered the whole tenancy — both
parties' names, addresses and phone numbers, the premises, the rent — to anyone who could guess an
application number. Both now sit inside the `auth:sanctum` group and share one guard,
`TenancyApplicationController::guardTenancyDocument()`, with the acknowledgement and the agreement;
each read, allowed or refused, is written to `user_activity_logs` under rule 4(3). No frontend
change was needed: all three call sites already fetched through the authenticated axios client, so
the "signed URLs" that earlier notes treated as the necessary fix were never required.
`tests/Unit/TenancyDocumentRoutesTest.php` reads the router and fails if any tenancy route is
declared outside the group again.

**Closed, 8 September 2026.** Every uploaded file — both parties' passport photographs, their
signatures, their PAN cards, the executed agreement, the signature on each of the eight service
forms — was written to the `public` disk and served at `/storage/<path>` with no authentication at
all, and the API handed out the paths for the SPA to build those URLs from. A permanent,
unauthenticated address for a named person's PAN card is the plainest possible breach of rule 4(4).
Uploads now go to a private `documents` disk that nothing web-serves, and leave only through
`GET /api/documents/{scope}/{id}/{field}`, which carries `signed` and expires within the hour;
`App\Support\DocumentStore` mints those URLs beside records the caller has already been authorised
to read. `php artisan documents:secure` moves the files already on the public disk. See
[backend-architecture.md §10](backend-architecture.md).
