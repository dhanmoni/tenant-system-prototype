{{--
  The paper a hearing notice or order is issued on.

  Until 8 September 2026 these documents existed only as React components rendered in the officer's
  browser, "printed" by replacing document.body.innerHTML and reloading the page. Nothing was
  stored, so there was no artifact to serve on a party, nothing that stayed fixed if the underlying
  application was edited afterwards, and - the reason for this file - nothing a digital signature
  could be attached to. A DSC signs bytes; it cannot sign a DOM.

  The markup deliberately stays plain: Dompdf, which renders it, supports little beyond tables and
  basic block layout.

  Where the signature goes. Every notice closes with a sign area - notices._signature, a blank box
  directly above the name of the authority it issues under - and the signature goes at the top of
  that box. App\Support\NoticeDocument::render() measures where Dompdf put the box, and that
  measurement is what the DSC agent is told.

  On most notices the sign area follows the text. A final order is also stamped on every page, and
  the agent puts every one of those stamps at the same corner it is given for the sign area. So on a
  final order the sign area and the name sit at the foot of the last page, in the bottom margin:
  the stamp lands on them there, and in the same blank margin on each earlier page.
--}}
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>{{ $documentTitle }} — {{ $caseNo }}</title>
    <style>
        {{-- A final order's bottom margin holds its sign area and name; see the note above. --}}
        @page { margin: 28mm 20mm {{ $signatureAtPageFoot ? '54mm' : '34mm' }} 20mm; }
        body {
            {{--
              Times, as legal documents are set. Dompdf has no Times New Roman file, so this resolves
              to the PDF standard Times-Roman, the same design, which every reader has built in. Its
              character set is Western European only: text outside it will not print correctly.
            --}}
            font-family: 'Times New Roman', Times, serif;
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
        /* The box and the name are one unit: a page break between them would sign an empty page. */
        .signature-block { margin-top: 28px; page-break-inside: avoid; }
        /*
          Out of the flow and into the bottom margin of the last page. An absolute offset counts from
          the content edge, so -42mm of a 54mm margin leaves the name's last line 12mm above the paper
          edge. The box and the three lines under it come to about 39mm, which keeps the top of the
          box a few millimetres clear of the text.
        */
        .signature-block-foot { position: absolute; left: 0; right: 0; bottom: -42mm; margin-top: 0; }
        /*
          Blank on the page; the agent draws the visible signature into it. The agent sizes the stamp
          to the certificate holder's name and is told only its top-left corner, so the box spans the
          whole text width: the browser steps left from the right edge by the officer's own stamp
          width (dscAgent.js), and a long name grows into the blank space rather than off the page.
          48pt is tall enough for the agent's two lines, which came out 36pt.
        */
        .signature-stamp { height: 48pt; }
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

<div class="signature-block right{{ $signatureAtPageFoot ? ' signature-block-foot' : '' }}">
    @include('notices._signature')
</div>

{{--
  The old templates closed with "generated digitally ... does not require a physical signature",
  which was true only while nothing was signed at all. Once a notice carries a DSC that sentence is
  actively misleading, so it says what is actually the case, and says something different depending
  on whether the signature has been applied yet.
--}}

</body>
</html>
