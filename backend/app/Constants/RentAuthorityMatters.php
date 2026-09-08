<?php

namespace App\Constants;

/**
 * The matters a Form IV application can be made under.
 *
 * Rule 11(1) of the Assam Tenancy Rules, 2025: "An application made to the Rent Authority under
 * sections 10, 14, 15 and 20 of the Act shall be made by the applicant in FORM - IV accompanied by
 * affidavits and documents, if any."
 *
 * Form IV itself asks only for "Particulars of violation against which the present application is
 * made" and never asks which of the four sections is invoked, even though the inquiry that follows
 * differs completely between them. The section is captured as a closed choice for that reason.
 *
 * Note: Act s. 31 gives the Rent Authority its powers for proceedings under ss. 4, 9, 10, 14, 15,
 * 19 or 20 - a wider list than rule 11(1)'s four. Section 19 (removal of a property manager) has no
 * prescribed form and is deliberately not offered here. See docs/gazette-divergences.md item D1.
 */
class RentAuthorityMatters
{
    public const SECTION_10 = 'ATA2021.s10';
    public const SECTION_14 = 'ATA2021.s14';
    public const SECTION_15 = 'ATA2021.s15';
    public const SECTION_20 = 'ATA2021.s20';

    public static function all(): array
    {
        return [self::SECTION_10, self::SECTION_14, self::SECTION_15, self::SECTION_20];
    }

    /** Marginal heading of each section, as printed in the Act. */
    public static function headings(): array
    {
        return [
            self::SECTION_10 => 'Rent Authority to determine the revised rent in case of dispute',
            self::SECTION_14 => 'Deposit of rent with Rent Authority',
            self::SECTION_15 => 'Repair and maintenance of property',
            self::SECTION_20 => 'Withholding essential supply and service',
        ];
    }

    /**
     * Second Schedule to the Act [See section 15 (1)] - division of maintenance responsibility.
     * Part A is the landlord's, Part B the tenant's. Transcribed from the Assam Gazette
     * Extraordinary, 1 October 2021, p. 2646.
     *
     * The Schedule opens: "Unless otherwise agreed in the tenancy agreement, the landlord shall be
     * responsible for repairs relating to the matters falling under Part A and the tenant shall be
     * responsible for matters falling under Part B."
     */
    public static function repairItems(): array
    {
        return [
            // Part A - Responsibilities of the Landlord
            'A1' => 'Structural repairs except those necessitated by the damage caused by the tenant.',
            'A2' => 'Whitewashing of walls and painting of doors and windows.',
            'A3' => 'Changing and plumbing pipes when necessary.',
            'A4' => 'Internal and external wiring and related maintenance when necessary.',

            // Part B - Periodic repairs to be got done by the tenant
            'B1' => 'Changing of tap washers and taps.',
            'B2' => 'Drain cleaning.',
            'B3' => 'Water closet repairs.',
            'B4' => 'Wash Basin repairs.',
            'B5' => 'Bath tub repairs.',
            'B6' => 'Geyser repairs.',
            'B7' => 'Circuit breaker repairs',
            'B8' => 'Switches and socket repairs.',
            'B9' => 'Repairs and replacement of electrical equipment except major internal and external wiring changes.',
            'B10' => 'Kitchen fixtures repairs.',
            'B11' => 'Replacement of knobs and locks of doors, cupboard, windows etc.',
            'B12' => 'Replacement of fly-nets.',
            'B13' => 'Replacement of glass panels in windows, doors etc.',
            'B14' => 'Maintenance of gardens and open spaces let out to or used by the tenant.',
        ];
    }

    public static function repairItemCodes(): array
    {
        return array_keys(self::repairItems());
    }

    /**
     * Essential services, from the Explanation to section 20:
     * "For the purposes of this section, essential services includes supply of water, electricity,
     * piped cooking gas supply, lights in passages, lifts and on staircase, conservancy, parking,
     * communication links, sanitary services and security fixtures and features."
     *
     * The Explanation says "includes", so the list is illustrative rather than exhaustive. An
     * "other" entry is therefore permitted alongside these.
     */
    public const SERVICE_OTHER = 'other';

    public static function essentialServices(): array
    {
        return [
            'water' => 'Supply of water',
            'electricity' => 'Electricity',
            'piped_gas' => 'Piped cooking gas supply',
            'passage_lights' => 'Lights in passages',
            'lifts_staircase' => 'Lifts and on staircase',
            'conservancy' => 'Conservancy',
            'parking' => 'Parking',
            'communication' => 'Communication links',
            'sanitary' => 'Sanitary services',
            'security' => 'Security fixtures and features',
            self::SERVICE_OTHER => 'Other essential service',
        ];
    }

    public static function essentialServiceCodes(): array
    {
        return array_keys(self::essentialServices());
    }
}
