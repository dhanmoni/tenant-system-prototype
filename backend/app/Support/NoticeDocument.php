<?php

namespace App\Support;

use App\Constants\ApplicationTypes;
use App\Models\CaseProceeding;
use Illuminate\Database\Eloquent\Model;

/**
 * Rendering a hearing notice or order to the PDF that is actually issued.
 *
 * The seven notice types were React components (components/dashboard/notice-templates/*.jsx),
 * rendered in the officer's browser and printed by swapping document.body.innerHTML. Nothing was
 * ever stored. That has three consequences this class exists to end: a party could not be served a
 * fixed document, the text could change under an already-issued notice if the application record
 * was edited, and there was nothing for a Digital Signature Certificate to sign - a DSC signs
 * bytes, not a DOM.
 *
 * The derivation below is a port of NoticeDocumentViewer.jsx and is deliberately faithful to it,
 * fallbacks included, so that notices issued before and after this change read the same.
 *
 * One thing is new. `authority()` names the office in whose authority the notice issues - Rent
 * Authority, Rent Court or Rent Tribunal, with the district. It is derived from the application,
 * never from the account operating the portal, because an order of the Rent Court is the Rent
 * Court's whether the presiding officer or their assistant prepared it. Who operated the signing is
 * a separate fact, recorded separately on case_proceedings.
 */
class NoticeDocument
{
    /** notice_type => the Blade view that prints it. */
    private const VIEWS = [
        'appearance' => 'notices.appearance',
        'applicant_absent' => 'notices.applicant_absent',
        'respondent_absent' => 'notices.respondent_absent',
        'adjournment' => 'notices.adjournment',
        'proceeding_sheet' => 'notices.proceeding_sheet',
        'final_order' => 'notices.final_order',
        'ex_parte' => 'notices.ex_parte',
    ];

    /** The heading each type is filed under, for the PDF title and the download filename. */
    private const TITLES = [
        'appearance' => 'Notice for Appearance',
        'applicant_absent' => 'Next Date Notice',
        'respondent_absent' => 'Next Date Notice',
        'adjournment' => 'Adjournment Order',
        'proceeding_sheet' => 'Proceeding Sheet',
        'final_order' => 'Final Order',
        'ex_parte' => 'Ex-Parte Order',
    ];

    /**
     * The placeholder the JSX printed when an officer left a free-text block empty. Kept so a
     * notice issued from the old screen and one issued from this renderer look the same.
     */
    private const EMPTY_LIST = "1.\n2.\n3.";

    /**
     * Notice types stamped on every page. Every other notice is signed once, in its sign area.
     *
     * The agent puts all of a document's stamps at the one corner it is given, so these cannot have
     * the sign area follow the text: it sits at the foot of the last page instead, where the stamp on
     * every earlier page falls in the same blank bottom margin.
     */
    private const SIGNED_ON_EVERY_PAGE = ['final_order'];

    /** The class of the blank box in notices._signature that the signature is drawn into. */
    private const STAMP_CLASS = 'signature-stamp';

    public static function supports(?string $noticeType): bool
    {
        return isset(self::VIEWS[(string) $noticeType]);
    }

    public static function titleFor(?string $noticeType): string
    {
        return self::TITLES[(string) $noticeType] ?? 'Notice';
    }

    /**
     * The fields each notice prints, and so cannot be issued without.
     *
     * Read off the templates. A notice with a blank date, time or venue summons a party to nowhere at
     * no time, and a final order with no terms disposes of the case on nothing. A field a template
     * does not print stays optional: it is kept on the proceeding but never reaches the page. The
     * templates' own fallbacks (the "1. 2. 3." placeholder, the recorded date standing in for a
     * previous hearing) remain only for proceedings recorded before these were enforced.
     *
     * ProceedingModal.jsx mirrors this list so the form can say so before submitting; this is the
     * authority.
     */
    private const REQUIRED_FIELDS = [
        'appearance' => ['hearing_date', 'hearing_time', 'venue'],
        'applicant_absent' => ['previous_hearing_date', 'hearing_date', 'hearing_time', 'venue'],
        'respondent_absent' => ['previous_hearing_date', 'hearing_date', 'hearing_time', 'venue'],
        'adjournment' => ['previous_hearing_date', 'hearing_date', 'hearing_time'],
        'proceeding_sheet' => ['hearing_date', 'remarks', 'additional_remarks'],
        'final_order' => ['hearing_date', 'remarks'],
        'ex_parte' => ['remarks', 'additional_remarks'],
    ];

    /** @return string[] */
    public static function requiredFields(?string $noticeType): array
    {
        return self::REQUIRED_FIELDS[(string) $noticeType] ?? [];
    }

    public static function signsEveryPage(?string $noticeType): bool
    {
        return in_array((string) $noticeType, self::SIGNED_ON_EVERY_PAGE, true);
    }

    /**
     * The office in whose authority this notice issues.
     *
     * Read off the application's form type, exactly as the printed notice has always done. The
     * account that clicks Sign does not enter into it.
     */
    public static function authority(CaseProceeding $proceeding, Model $application): string
    {
        $office = self::officeName($proceeding, $application);
        $district = self::districtName($application);

        return $district === '' ? $office : $office . ', ' . $district;
    }

    /**
     * Which forum issues this notice.
     *
     * NoticeDocumentViewer.jsx read `application.form_type`, which works in the browser because
     * ApplicationResource synthesises that field on the way out. It is not a column: on the model
     * itself it is null, so porting the check unchanged printed - and would have digitally signed -
     * every Rent Court and Rent Tribunal order as "Rent Authority".
     *
     * The proceeding's own `application_type` is the slug from App\Constants\ApplicationTypes and
     * is always set, so the forum is derived from that, by an explicit map rather than by matching
     * substrings of a slug that may be renamed.
     */
    private static function officeName(CaseProceeding $proceeding, Model $application): string
    {
        $type = (string) ($proceeding->application_type ?: $application->form_type);

        return match ($type) {
            ApplicationTypes::RENT_COURT_POSSESSION,
            ApplicationTypes::RENT_COURT_FILING,
            ApplicationTypes::RENT_COURT_APPEAL => 'Rent Court',

            ApplicationTypes::RENT_TRIBUNAL_APPEAL => 'Rent Tribunal',

            // Forms I, I-A and I-B and the section 10/14/15/20 applications of Form IV are all made
            // to the Rent Authority; rule 5(4) has it appoint the valuer as well.
            ApplicationTypes::RENT_REVISION,
            ApplicationTypes::OTHER_CHARGES_REVISION,
            ApplicationTypes::VALUER_APPOINTMENT,
            ApplicationTypes::RENT_AUTHORITY_FILING => 'Rent Authority',

            default => self::officeFromSlug($type),
        };
    }

    /** Last resort for a slug this build does not know, so a notice still names a forum. */
    private static function officeFromSlug(string $type): string
    {
        if (str_contains($type, 'rent-tribunal')) {
            return 'Rent Tribunal';
        }

        if (str_contains($type, 'rent-court')) {
            return 'Rent Court';
        }

        return 'Rent Authority';
    }

    private static function districtName(Model $application): string
    {
        return trim((string) ($application->district->name ?? ''));
    }

    /**
     * The view data, ported from NoticeDocumentViewer.jsx.
     *
     * Every fallback chain is the one the browser used. Where the JSX ended a chain with a literal
     * ('Applicant', 'Address', 'Assam'), that literal is kept: a notice that prints "Address" is
     * wrong, but printing nothing where a name should be is worse, and changing the behaviour here
     * would make old and new notices disagree.
     */
    public static function data(CaseProceeding $proceeding, Model $application, bool $signed): array
    {
        $signedBy = (string) ($application->signed_by ?? '');
        $isLandlordApp = in_array($signedBy, ['landlord', 'landlord_manager'], true);

        $applicantName = $application->appellant_name
            ?: $application->applicant_name
            ?: ($isLandlordApp ? $application->landlord_name : $application->tenant_name)
            ?: ($application->user->name ?? null)
            ?: 'Applicant';

        $applicantAddress = $application->appellant_residential_address
            ?: $application->applicant_residential_address
            ?: ($isLandlordApp ? $application->landlord_address : $application->tenant_address)
            ?: 'Address';

        $respondentName = $application->respondent_name
            ?: ($isLandlordApp ? $application->tenant_name : $application->landlord_name)
            ?: 'Respondent';

        $respondentAddress = $application->respondent_residential_address
            ?: $application->tenant_residential_address
            ?: ($isLandlordApp ? $application->tenant_address : $application->landlord_address)
            ?: 'Address';

        $propertyAddress = $application->rent_tribunal_at
            ?: $application->rent_court_at
            ?: $application->before_rent_court
            ?: self::districtName($application)
            ?: 'Assam';

        return [
            'documentTitle' => self::titleFor($proceeding->notice_type),
            'officeName' => self::officeName($proceeding, $application),
            'districtName' => self::districtName($application),
            'caseNo' => (string) ($application->application_no ?? ''),
            // The date the proceeding was recorded, not today: re-rendering a notice must not
            // silently re-date it.
            'dateStr' => optional($proceeding->created_at)->format('d/m/Y') ?? '',
            'applicantName' => $applicantName,
            'applicantAddress' => $applicantAddress,
            'respondentName' => $respondentName,
            'respondentAddress' => $respondentAddress,
            'propertyAddress' => $propertyAddress,
            'hearingDate' => (string) ($proceeding->hearing_date ?? ''),
            'hearingTime' => (string) ($proceeding->hearing_time ?? ''),
            'venue' => (string) ($proceeding->venue ?? ''),
            'previousHearingDate' => (string) ($proceeding->previous_hearing_date ?? ''),
            'remarks' => trim((string) $proceeding->remarks) !== ''
                ? $proceeding->remarks
                : self::EMPTY_LIST,
            'additionalRemarks' => trim((string) $proceeding->additional_remarks) !== ''
                ? $proceeding->additional_remarks
                : self::EMPTY_LIST,
            // Drives the closing attestation: a draft says so in terms, so an unsigned copy that
            // escapes the office cannot be mistaken for an issued notice.
            'signed' => $signed,
            'signatureAtPageFoot' => self::signsEveryPage($proceeding->notice_type),
        ];
    }

    public static function html(CaseProceeding $proceeding, Model $application, bool $signed): string
    {
        $view = self::VIEWS[(string) $proceeding->notice_type] ?? null;
        if (!$view) {
            throw new \InvalidArgumentException('No notice template for type ' . $proceeding->notice_type);
        }

        return view($view, self::data($proceeding, $application, $signed))->render();
    }

    /**
     * The PDF bytes, and where on them the digital signature goes.
     *
     * The DSC agent draws its visible signature into a rectangle on a page. Left to itself it uses
     * one fixed rectangle from its own config, bottom right, wherever the text happened to end. The
     * signature belongs over the authority's name, and that name moves with what the officer typed,
     * so the renderer - the only thing that knows where it landed - measures it while Dompdf draws
     * the page: each signature box reports its page and position as it is rendered.
     *
     * The placement is recorded in the agent's own terms. Its request takes `rectMode: "top-left"`,
     * the stamp's left and top edge in points from the top left of the page, and a page number from
     * 1; so the sign area is [left, top, right, bottom] measured the same way:
     *
     *     ['page_count' => int, 'every_page' => bool, 'sign_area' => ['page' => int, 'rect' => [...]]]
     *
     * The agent is only given the corner and sizes the stamp to the certificate holder's name, so the
     * box spans the text width and the browser right-aligns the stamp inside it, using the width the
     * officer's previous stamp came out at - see stampWidth() and .signature-stamp in the layout.
     *
     * US Legal (8.5 x 14 in, 612 x 1008 pt), the paper these are issued on. Always the one size,
     * because coordinates on a page size that varied would not mean the same thing twice. How much
     * of each page the notice fills does vary, with the remarks, and needs no handling beyond the
     * measurement: the box goes wherever the name went.
     *
     * @return array{0: string, 1: array}
     */
    public static function render(CaseProceeding $proceeding, Model $application, bool $signed): array
    {
        if (!class_exists('Dompdf\\Dompdf')) {
            throw new \RuntimeException('Dompdf is not installed, so notices cannot be issued as PDFs.');
        }

        $signArea = null;

        $dompdf = new \Dompdf\Dompdf();
        $dompdf->setCallbacks([[
            'event' => 'end_frame',
            'f' => function ($frame, $canvas) use (&$signArea) {
                $node = $frame->get_node();
                if (!$node instanceof \DOMElement
                    || !in_array(self::STAMP_CLASS, explode(' ', $node->getAttribute('class')), true)) {
                    return;
                }

                // Dompdf measures from the top left of the page, as the agent's top-left mode does.
                [$x, $y, $width, $height] = $frame->get_border_box();

                $signArea = [
                    'page' => $canvas->get_page_number(),
                    'rect' => array_map(fn ($value) => round($value, 2), [$x, $y, $x + $width, $y + $height]),
                ];
            },
        ]]);
        $dompdf->loadHtml(self::html($proceeding, $application, $signed));
        $dompdf->setPaper('legal');
        $dompdf->render();

        $placement = [
            'page_count' => $dompdf->getCanvas()->get_page_count(),
            'every_page' => self::signsEveryPage($proceeding->notice_type),
            'sign_area' => $signArea,
        ];

        return [$dompdf->output(), $placement];
    }

    /**
     * How wide the agent drew the visible signature on a signed notice, in points.
     *
     * The agent sizes its stamp to the certificate holder's name and is only told where the stamp's
     * top-left corner goes. To right-align the next stamp an officer applies, the signing flow needs
     * to know how wide theirs comes out, and the only place that is written down is the signature
     * widget's /Rect in the PDF the agent returns - which it writes as a plain, uncompressed object.
     *
     * Null when no widget with a width is found; the next signing then falls back to a default.
     */
    public static function stampWidth(string $signedPdf): ?float
    {
        if (!preg_match_all('#\bobj\b(.*?)\bendobj\b#s', $signedPdf, $objects)) {
            return null;
        }

        foreach ($objects[1] as $body) {
            if (!preg_match('#/Subtype\s*/Widget\b#', $body)
                || !preg_match('#/Rect\s*\[\s*(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s*\]#', $body, $rect)) {
                continue;
            }

            // An invisible signature has a zero-size widget; it says nothing about the stamp.
            $width = abs((float) $rect[3] - (float) $rect[1]);
            if ($width > 0) {
                return round($width, 2);
            }
        }

        return null;
    }

    /** The filename a party sees when they download it. */
    public static function filename(CaseProceeding $proceeding, Model $application): string
    {
        $slug = str_replace('_', '-', (string) $proceeding->notice_type);
        $case = preg_replace('/[^A-Za-z0-9\-]/', '', (string) ($application->application_no ?? 'notice'));

        return $slug . '-' . $case . '.pdf';
    }
}
