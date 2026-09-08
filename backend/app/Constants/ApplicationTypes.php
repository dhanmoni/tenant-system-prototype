<?php

namespace App\Constants;

class ApplicationTypes
{
    public const TENANCY_CERTIFICATE = 'tenancy';
    public const RENT_REVISION = 'form-i-rent-revision';
    public const OTHER_CHARGES_REVISION = 'form-i-a-other-charges-revision';
    public const VALUER_APPOINTMENT = 'form-i-b-valuer-appointment';
    public const RENT_COURT_POSSESSION = 'form-ii-rent-court-possession';
    public const RENT_COURT_FILING = 'form-iii-rent-court-filing';
    public const RENT_AUTHORITY_FILING = 'form-iv-rent-authority-filing';
    public const RENT_COURT_APPEAL = 'form-v-rent-court-appeal';
    public const RENT_TRIBUNAL_APPEAL = 'form-vi-rent-tribunal-appeal';

    public static function all(): array
    {
        return [
            self::TENANCY_CERTIFICATE,
            self::RENT_REVISION,
            self::OTHER_CHARGES_REVISION,
            self::VALUER_APPOINTMENT,
            self::RENT_COURT_POSSESSION,
            self::RENT_COURT_FILING,
            self::RENT_AUTHORITY_FILING,
            self::RENT_COURT_APPEAL,
            self::RENT_TRIBUNAL_APPEAL,
        ];
    }

    /**
     * The Eloquent model behind an application type.
     *
     * ApplicationWorkflowController carried this map privately, and DocumentStore needs the same
     * one to know which record a signed document URL belongs to. Two copies of it would be one
     * copy too many - a type present in one and missing from the other fails silently, as a
     * 404 on a document that exists.
     */
    public static function modelFor(string $type): ?string
    {
        return match ($type) {
            self::TENANCY_CERTIFICATE => \App\Models\TenancyApplication::class,
            self::RENT_REVISION => \App\Models\RentRevisionApplication::class,
            self::OTHER_CHARGES_REVISION => \App\Models\OtherChargesRevisionApplication::class,
            self::VALUER_APPOINTMENT => \App\Models\ValuerAppointmentApplication::class,
            self::RENT_COURT_POSSESSION => \App\Models\RentCourtPossessionApplication::class,
            self::RENT_COURT_FILING => \App\Models\RentCourtFilingApplication::class,
            self::RENT_AUTHORITY_FILING => \App\Models\RentAuthorityFilingApplication::class,
            self::RENT_COURT_APPEAL => \App\Models\RentCourtAppealApplication::class,
            self::RENT_TRIBUNAL_APPEAL => \App\Models\RentTribunalAppealApplication::class,
            default => null,
        };
    }

    /** Rent Authority / Court / Tribunal form applications (excludes UIN / tenancy certificate). */
    public static function serviceForms(): array
    {
        return array_values(array_filter(
            self::all(),
            fn (string $type) => $type !== self::TENANCY_CERTIFICATE
        ));
    }
}
