<?php

namespace App\Constants;

/**
 * Statutory basis and grounds for a Form II application (recovery of possession).
 *
 * Rule 7 of the Assam Tenancy Rules, 2025 routes Form II to sub-section (2) of section 21 or to
 * section 22 of the Assam Tenancy Act, 2021. Form II prints three blank lines under
 * "on following ground:", but the grounds are a closed statutory list, so they are stored as clause
 * codes rather than free text.
 *
 * Note on the count: section 21(2) allows an order "on one or more of the following grounds" and
 * lists eight clauses. The printed form's three lines are a typographic convenience, not a limit,
 * so no cap of three is imposed here. Recorded in docs/gazette-divergences.md.
 *
 * Section 22 has no sub-grounds: it is a single basis, available to the legal heirs of a deceased
 * landlord who have a bonafide requirement of the premises.
 */
class EvictionGrounds
{
    /** Statutory basis of the application. */
    public const BASIS_SECTION_21_2 = 'ATA2021.s21.2';
    public const BASIS_SECTION_22 = 'ATA2021.s22';

    /** Clause codes under section 21(2). */
    public const CLAUSE_A = 'a';
    public const CLAUSE_B = 'b';
    public const CLAUSE_C = 'c';
    public const CLAUSE_D = 'd';
    public const CLAUSE_E = 'e';
    public const CLAUSE_F = 'f';
    public const CLAUSE_G = 'g';
    public const CLAUSE_H = 'h';

    public static function bases(): array
    {
        return [self::BASIS_SECTION_21_2, self::BASIS_SECTION_22];
    }

    public static function clauses(): array
    {
        return [
            self::CLAUSE_A,
            self::CLAUSE_B,
            self::CLAUSE_C,
            self::CLAUSE_D,
            self::CLAUSE_E,
            self::CLAUSE_F,
            self::CLAUSE_G,
            self::CLAUSE_H,
        ];
    }

    /**
     * Clause text as printed in the Act, Gazette Extraordinary 1 October 2021, pp. 2631-2633.
     * Transcribed from the page images; the Act carries no marginal summary for each clause, so the
     * text below is the clause itself, lightly trimmed only where a clause runs into a proviso.
     */
    public static function clauseText(): array
    {
        return [
            self::CLAUSE_A => 'that the tenant does not agree to pay the rent payable under section 8;',
            self::CLAUSE_B => 'that the tenant has not paid the arrears of rent and other charges payable in full as specified in sub-section (1) of section 13 for two consecutive months, including interest for delayed payment as may be specified in the tenancy agreement within a period of one month from the date of service of notice of demand for payment of such arrears of rent and other charges payable to the landlord in the manner provided in sub-section (4) of section 106 of the Transfer of Property Act, 1882;',
            self::CLAUSE_C => 'that the tenant has, after the commencement of this Act, parted with the possession of whole or any part of the premises without obtaining the written consent of the landlord;',
            self::CLAUSE_D => 'that the tenant has continued to misuse the premises even after receipt of notice from the landlord to desist from such misuse;',
            self::CLAUSE_E => 'where it is necessary for the landlord to carry out any repair or construction or rebuilding or addition or alteration or demolition in respect of the premises or any part thereof, which is not possible to be carried out without the premises being vacated;',
            self::CLAUSE_F => 'that the premises or any part thereof is required by the landlord for carrying out any repairs, construction, rebuilding, additions, alterations or demolition, for change of its use as a consequence of change of land use by the competent authority;',
            self::CLAUSE_G => 'that the landlord has given written notice to vacate the premises let out on rent and in consequence of that notice the landlord has contracted to sell the said premises or has taken any other step, as a result of which his interests would seriously suffer if he is not put in possession of that premises;',
            self::CLAUSE_H => 'that the tenant has carried out any structural change or erected any permanent structure in the premises let out on rent without the written consent of the landlord.',
        ];
    }

    /**
     * Explanations printed under a clause in the Act. Shown alongside the clause so the filer sees
     * the statutory meaning rather than a paraphrase.
     */
    public static function clauseExplanations(): array
    {
        return [
            self::CLAUSE_D => 'Explanation.- For the purposes of this clause, "misuse of premises" means encroachment of additional space by the tenant or use of premises which causes public nuisance or causes damage to the property or is detrimental to the interest of the landlord or for immoral or illegal purposes.',
            self::CLAUSE_F => 'Explanation.- For the purposes of this clause, the expression "competent authority" means the Municipal Corporation or the Municipality or the Development Authority or any other authority, as the case may be, which provides permission on matters relating to repair or redevelopment or demolition of building or permission for change in land use.',
        ];
    }

    /** Provision id for a clause, for the citation shown next to it. */
    public static function provisionId(string $clause): string
    {
        return self::BASIS_SECTION_21_2 . '.' . $clause;
    }
}
