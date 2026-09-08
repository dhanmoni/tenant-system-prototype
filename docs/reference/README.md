# Statutory reference

Verbatim transcripts of the two Gazette documents the tenancy portal implements.

| File | Instrument | Gazette | Date |
|---|---|---|---|
| [assam-tenancy-act-2021-transcript.md](assam-tenancy-act-2021-transcript.md) | The Assam Tenancy Act, 2021 (Assam Act No. XXXI of 2021) | Extraordinary, pp. 2619–2646 | 1 Oct 2021 |
| [assam-tenancy-rules-2025-transcript.md](assam-tenancy-rules-2025-transcript.md) | The Assam Tenancy Rules, 2025, made under Act s. 44, with Forms I–VI | Extraordinary No. 494, Dispur, pp. 4173–4192 | 10 Jul 2025 |

## How these were produced

Both source PDFs are photographs of printed pages with **no text layer** — `pdftotext` returns only
the running page headers. Nothing here comes from automated text extraction. All 48 pages were
rendered to images at 150 dpi and read directly, and every passage was transcribed from the page
image.

The Act transcript covers the provisions the forms depend on. Pages not read are listed at the top
of that file; anything cited from them is marked `TODO(legal-text)` rather than guessed.

## Why they live in the repo

The provision text is legally load-bearing — it is quoted to citizens on the forms, snapshotted into
`filing_attestations` when a declaration is accepted, and relied on for every deadline. Keeping a
verified transcript in version control means the wording can be checked without re-reading scans,
and any future change to it shows up in a diff.

**These are transcripts, not the authority.** The Gazette is. Where something matters, check it
against the original.

## Related

- [../gazette-divergences.md](../gazette-divergences.md) — where the Act, the Rules and the printed
  forms disagree, and which way each was resolved.
- [../statutory-forms-engine-plan.md](../statutory-forms-engine-plan.md) — the implementation plan
  and what remains open.
