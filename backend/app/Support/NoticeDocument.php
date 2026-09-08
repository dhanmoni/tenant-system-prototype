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

    public static function supports(?string $noticeType): bool
    {
        return isset(self::VIEWS[(string) $noticeType]);
    }

    public static function titleFor(?string $noticeType): string
    {
        return self::TITLES[(string) $noticeType] ?? 'Notice';
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
     * The PDF bytes.
     *
     * A4 to match the paper these are printed on, and because the DSC agent places its visible
     * signature widget by absolute coordinates - a page size that varied would move the stamp.
     */
    public static function pdf(CaseProceeding $proceeding, Model $application, bool $signed): string
    {
        if (!class_exists('Dompdf\\Dompdf')) {
            throw new \RuntimeException('Dompdf is not installed, so notices cannot be issued as PDFs.');
        }

        $dompdf = new \Dompdf\Dompdf();
        $dompdf->loadHtml(self::html($proceeding, $application, $signed));
        $dompdf->setPaper('A4');
        $dompdf->render();

        return $dompdf->output();
    }

    /** The filename a party sees when they download it. */
    public static function filename(CaseProceeding $proceeding, Model $application): string
    {
        $slug = str_replace('_', '-', (string) $proceeding->notice_type);
        $case = preg_replace('/[^A-Za-z0-9\-]/', '', (string) ($application->application_no ?? 'notice'));

        return $slug . '-' . $case . '.pdf';
    }
}
