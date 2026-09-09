{{--
  The paper a hearing notice or order is issued on.

  Until 8 September 2026 these documents existed only as React components rendered in the officer's
  browser, "printed" by replacing document.body.innerHTML and reloading the page. Nothing was
  stored, so there was no artifact to serve on a party, nothing that stayed fixed if the underlying
  application was edited afterwards, and - the reason for this file - nothing a digital signature
  could be attached to. A DSC signs bytes; it cannot sign a DOM.

  The markup deliberately stays plain: Dompdf, which renders it, supports little beyond tables and
  basic block layout, and this has to paginate predictably because the DSC agent stamps its visible
  signature widget onto the page at fixed coordinates.
--}}
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>{{ $documentTitle }} — {{ $caseNo }}</title>
    <style>
        @page { margin: 28mm 20mm 34mm 20mm; }
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #000;
        }
        .centre { text-align: center; }
        .right { text-align: right; }
        .bold { font-weight: bold; }
        .italic { font-style: italic; }
        .rule { border-bottom: 1px solid #000; margin: 10px 0; }
        .head-title { font-weight: bold; font-size: 12.5pt; }
        .head-org { font-weight: bold; font-size: 12pt; margin: 0; }
        .block { margin-bottom: 18px; }
        .para { margin: 0 0 12px; text-align: justify; }
        .indent { margin-left: 24px; }
        /* Remarks are typed by the officer and carry their own line breaks. */
        .verbatim { white-space: pre-wrap; margin-left: 24px; margin-bottom: 12px; }
        table.appearances { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        table.appearances th, table.appearances td {
            border: 1px solid #000; padding: 4px 6px; text-align: left; font-size: 10.5pt;
        }
        .signature-block { margin-top: 28px; }
        .authority { font-weight: bold; }
        .attestation {
            margin-top: 22px; padding-top: 8px; border-top: 1px solid #000;
            font-size: 9.5pt; line-height: 1.4;
        }
    </style>
</head>
<body>

@yield('masthead')

<div class="block">
    <div><span class="bold">Case No. :</span> {{ $caseNo }}</div>
    <div><span class="bold">Date :</span> {{ $dateStr }}</div>
</div>

@yield('body')

<div class="signature-block right">
    <div class="authority">{{ $officeName }}</div>
    @if ($districtName)
        <div>{{ $districtName }}</div>
    @endif
    <div>Government of Assam</div>
</div>

{{--
  The old templates closed with "generated digitally ... does not require a physical signature",
  which was true only while nothing was signed at all. Once a notice carries a DSC that sentence is
  actively misleading, so it says what is actually the case, and says something different depending
  on whether the signature has been applied yet.
--}}

</body>
</html>
