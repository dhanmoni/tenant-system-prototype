<?php

namespace App\Constants;

/**
 * Sworn declarations printed on the service forms, verbatim.
 *
 * These strings are legally load-bearing: they are what a filer accepts, and what a filing must be
 * able to reproduce years later. Transcribed from the page images of the Schedule to the Assam
 * Tenancy Rules, 2025, Assam Gazette Extraordinary No. 494, 10 July 2025, pp. 4183-4192.
 *
 * Do not reword these. Do not "tidy" the punctuation. Form IV's jurisdiction declaration closes
 * without a full stop and Forms II, III, V and VI close with one; that difference is in the Gazette
 * and is reproduced here deliberately. See docs/gazette-divergences.md item E1.
 *
 * If a declaration is ever amended, add the new wording as a new constant rather than editing an
 * existing one, so filings already accepted keep rendering the text their filer actually saw.
 */
class Declarations
{
    /**
     * The VERIFICATION sentence, verbatim, with the printed blanks as named placeholders.
     *
     * Transcribed from Form II, p.4184; Forms III to VI print the same sentence. Every blank the
     * Gazette leaves is a placeholder here and nothing else has been altered - not the missing
     * comma after the relation, not the run-on "and ... and", not the spelling of "paras".
     *
     * The sentence is stored whole rather than assembled from fragments so that what a filer swore
     * can be reproduced years later by substitution alone, with no code path able to reword it.
     */
    private const VERIFICATION_TEMPLATE = 'I, :name :relation :relative_name aged :age residing at :address, do hereby verify that the contents of paras :personal_paras are true to my personal knowledge and paras :advised_paras believed to be true on legal advice received and I hereby declare that I have not suppressed any material facts.';

    /**
     * The recital that opens Form I-B, p.4182, verbatim, with the printed blanks as placeholders.
     *
     * Reproduced as printed, spacing included: the Gazette sets a space before the comma in
     * "resident of ____ , landlord or tenant" and again in "District- ____ , Assam". "landlord or
     * tenant" is a pair of alternatives the filer strikes one of, like the S/o. / W/o. / D/o. of
     * the verification, so it is a placeholder here rather than fixed text.
     */
    private const FORM_IB_APPLICATION_TEMPLATE = 'I, :name :relation of :relative_name resident of :residence , :capacity of premises situated at :premises District- :district , Assam hereby make this application to appoint the government recognized valuer to evaluate the rent and or other charges of the aforesaid premises.';

    /** Field ids, namespaced by form. */
    public const FORM_II_JURISDICTION = 'form_ii.para_2_jurisdiction';
    public const FORM_III_JURISDICTION = 'form_iii.para_2_jurisdiction';
    public const FORM_IV_JURISDICTION = 'form_iv.para_2_jurisdiction';
    public const FORM_V_JURISDICTION = 'form_v.para_2_jurisdiction';
    public const FORM_VI_JURISDICTION = 'form_vi.para_2_jurisdiction';

    public const FORM_IB_APPLICATION = 'form_i_b.application';
    public const FORM_IB_UNDERTAKING = 'form_i_b.valuer_fee_undertaking';

    public const FORM_II_VERIFICATION = 'form_ii.verification';
    public const FORM_III_VERIFICATION = 'form_iii.verification';
    public const FORM_IV_VERIFICATION = 'form_iv.verification';
    public const FORM_V_VERIFICATION = 'form_v.verification';
    public const FORM_VI_VERIFICATION = 'form_vi.verification';

    public const FORM_V_LIMITATION = 'form_v.para_3_limitation';
    public const FORM_VI_LIMITATION = 'form_vi.para_3_limitation';

    public const FORM_II_PRIOR_PROCEEDINGS = 'form_ii.para_5_prior_proceedings';
    public const FORM_III_PRIOR_PROCEEDINGS = 'form_iii.para_5_prior_proceedings';
    public const FORM_IV_PRIOR_PROCEEDINGS = 'form_iv.para_5_prior_proceedings';
    public const FORM_V_PRIOR_PROCEEDINGS = 'form_v.para_5_prior_proceedings';
    public const FORM_VI_PRIOR_PROCEEDINGS = 'form_vi.para_5_prior_proceedings';

    /**
     * Verbatim text of each declaration, without the enclosing parentheses the Gazette prints
     * around it.
     */
    public static function text(): array
    {
        return [
            self::FORM_II_JURISDICTION => 'The applicant declares that the subject matter of this application is within the jurisdiction of the Rent Court.',
            self::FORM_III_JURISDICTION => 'The applicant declares that the subject matter of this application is within the jurisdiction of the Rent Court.',
            self::FORM_IV_JURISDICTION => 'The applicant declares that the subject matter of this application is within the jurisdiction of the Rent Authority',
            self::FORM_V_JURISDICTION => 'The appellant declares that the subject matter of appeal as against which he wants redressal is within the jurisdiction of the Rent Court.',
            self::FORM_VI_JURISDICTION => 'The appellant declares that the subject matter of appeal as against which he wants redressal is within the jurisdiction of the Rent Tribunal.',

            // Paragraph 3 of Forms V and VI is Limitation, and like paragraphs 2 and 5 the
            // parenthetical under the label IS the answer: "The appellant further declares...".
            // It is an assertion, not a question, so it is a declaration and not free text.
            //
            // Two Gazette slips reproduced here. Form VI cites "sub-section (1) of section 38",
            // which does not carry the appeal period - rule 13(1) and s. 37(1) do; see
            // docs/gazette-divergences.md. And Form V prints "Act No XXXI" where Form VI prints
            // "Act No. XXXI". Neither is corrected: this is what the appellant declares.
            self::FORM_V_LIMITATION => 'The appellant further declares that the appeal is within the limitation period prescribed in sub-section (2) of section 32 of the Assam Tenancy Act (Act No XXXI of 2021)',
            self::FORM_VI_LIMITATION => 'The appellant further declares that the appeal is within the limitation period prescribed in sub-section (1) of section 38 of the Assam Tenancy Act (Act No. XXXI of 2021)',

            // Paragraph 5, first limb: the negative declaration. Only this sentence is asserted.
            // The second limb, quoted in branchText() below, is the instruction that applies when
            // the filer cannot make this declaration, so it is not part of what is sworn.
            self::FORM_II_PRIOR_PROCEEDINGS => 'The applicant further declares that he/she had not previously filed any application, petition, writ petition or suit regarding the matter in respect of which this application has been made, before any court or any other authority or any other Bench of the Tribunal nor any such application, writ petition or suit is pending before any of them.',
            self::FORM_III_PRIOR_PROCEEDINGS => 'The applicant further declares that he/she had not previously filed any application, petition, writ petition or suit regarding the matter in respect of which this application has been made, before any court or any other authority or any other Bench of the Tribunal nor any such application, writ petition or suit is pending before any of them.',
            self::FORM_IV_PRIOR_PROCEEDINGS => 'The applicant further declares that he/she had not previously filed any application, petition, writ petition or suit regarding the matter in respect of which this application has been made, before any court or any other authority or any other Bench of the any tribunal nor any such application, writ petition or suit is pending before any of them.',
            self::FORM_V_PRIOR_PROCEEDINGS => 'The appellant further declares that he/she had not previously filed any application, petition, writ petition or suit regarding the matter in respect of which this appeal has been made, before any court or any other authority or any other Bench of the Tribunal nor any such application, writ petition or suit is pending before any of them.',
            self::FORM_VI_PRIOR_PROCEEDINGS => 'The appellant further declares that he/she had not previously filed any application, petition, writ petition or suit regarding the matter in respect of which this appeal has been made, before any court or any other authority or any other Bench of the Tribunal nor any such application, writ petition or suit is pending before any of them.',

            self::FORM_IB_APPLICATION => self::FORM_IB_APPLICATION_TEMPLATE,

            // Printed as a free-standing sentence above the signature rather than inside brackets,
            // but functionally a declaration: it is the undertaking rule 5(4) requires the
            // applicant to make, and the fee follows from it.
            self::FORM_IB_UNDERTAKING => 'I hereby agree to bear the fee of the valuer as determined by the Rent Authority.',

            // The VERIFICATION clause that closes Forms II to VI. Printed identically on all five,
            // including on the two appeal forms, which say "Applicant" where one would expect
            // "Appellant" - reproduced as printed. See docs/gazette-divergences.md item E3.
            //
            // The placeholders are the printed blanks. Only App\Support\Verification fills them,
            // and only server-side: the filer supplies the values, never the sentence.
            self::FORM_II_VERIFICATION => self::VERIFICATION_TEMPLATE,
            self::FORM_III_VERIFICATION => self::VERIFICATION_TEMPLATE,
            self::FORM_IV_VERIFICATION => self::VERIFICATION_TEMPLATE,
            self::FORM_V_VERIFICATION => self::VERIFICATION_TEMPLATE,
            self::FORM_VI_VERIFICATION => self::VERIFICATION_TEMPLATE,
        ];
    }

    /**
     * Provisions each declaration rests on.
     *
     * Territorial jurisdiction: the Rent Authority is appointed by the Deputy Commissioner "within
     * his jurisdiction" (s. 30), the Rent Court likewise (s. 33), the Rent Tribunal is appointed
     * per district (s. 34), an appeal lies to the Rent Court "having territorial jurisdiction"
     * (s. 32(1)) and to the Rent Tribunal "within the jurisdiction/local limits of which the
     * premise is situated" (s. 37(1)).
     */
    public static function provisions(): array
    {
        return [
            self::FORM_II_JURISDICTION => ['ATA2021.s33', 'ATR2025.r7'],
            self::FORM_III_JURISDICTION => ['ATA2021.s33', 'ATR2025.r10'],
            self::FORM_IV_JURISDICTION => ['ATA2021.s30', 'ATR2025.r11.1'],
            self::FORM_V_JURISDICTION => ['ATA2021.s32.1', 'ATA2021.s33', 'ATR2025.r12'],
            self::FORM_VI_JURISDICTION => ['ATA2021.s37.1', 'ATA2021.s34', 'ATR2025.r13.1'],

            // s. 32(2) gives the thirty days Form V's declaration is about. Form VI's own citation
            // is wrong, so the provisions that actually govern are cited alongside what it prints.
            self::FORM_V_LIMITATION => ['ATA2021.s32.2', 'ATR2025.r12'],
            self::FORM_VI_LIMITATION => ['ATA2021.s37.1', 'ATR2025.r13.1'],

            // Paragraph 5 has no provision behind it. It is a requirement of the printed form
            // itself, not of the Act or the Rules, so the form is cited rather than a section.
            self::FORM_II_PRIOR_PROCEEDINGS => ['ATR2025.r7'],
            self::FORM_III_PRIOR_PROCEEDINGS => ['ATR2025.r10'],
            self::FORM_IV_PRIOR_PROCEEDINGS => ['ATR2025.r11.1'],
            self::FORM_V_PRIOR_PROCEEDINGS => ['ATR2025.r12'],
            self::FORM_VI_PRIOR_PROCEEDINGS => ['ATR2025.r13.1'],

            // Rule 5(4) is the whole of Form I-B: it is what lets an aggrieved party ask for a
            // valuer, and its closing words - "The fee of valuer shall be borne by the aggrieved
            // party, who has filed the application" - are what the undertaking undertakes.
            self::FORM_IB_APPLICATION => ['ATR2025.r5.4'],
            self::FORM_IB_UNDERTAKING => ['ATR2025.r5.4'],

            // The verification is required by the printed form, so the rule prescribing that form
            // is cited. Alongside it, s. 36(2) deems proceedings before the Rent Court and the Rent
            // Tribunal judicial proceedings for ss. 193, 228 and 196 IPC - which is what gives a
            // false verification consequences, and so is part of what the filer is told.
            //
            // Form IV goes to the Rent Authority, which s. 36(2) does not name. It reaches the same
            // place by s. 31: the Rent Authority has the powers of a Rent Court and "the procedure
            // as laid down in sections 35 and 36 shall apply" in proceedings under ss. 4, 9, 10,
            // 14, 15, 19 and 20 - which covers all four matters Form IV routes through rule 11(1).
            self::FORM_II_VERIFICATION => ['ATR2025.r7', 'ATA2021.s36.2'],
            self::FORM_III_VERIFICATION => ['ATR2025.r10', 'ATA2021.s36.2'],
            self::FORM_IV_VERIFICATION => ['ATR2025.r11.1', 'ATA2021.s31', 'ATA2021.s36.2'],
            self::FORM_V_VERIFICATION => ['ATR2025.r12', 'ATA2021.s36.2'],
            self::FORM_VI_VERIFICATION => ['ATR2025.r13.1', 'ATA2021.s36.2'],
        ];
    }

    /**
     * The second limb of paragraph 5: what the form requires when the filer HAS previously filed.
     * Not part of the sworn declaration, so it is never snapshotted as one - it is shown as the
     * instruction it is. Form IV and Form VI print a semicolon where Forms II, III and V print a
     * comma; both are reproduced as printed.
     */
    public static function branchText(): array
    {
        return [
            self::FORM_II_PRIOR_PROCEEDINGS => 'In case the applicant has previously filed any such application, writ petition or suit, the details of the pendency of such cases filed, or if disposed, the decisions of such cases to be enclosed.',
            self::FORM_III_PRIOR_PROCEEDINGS => 'In case the applicant has previously filed any such application, writ petition or suit, the details of the pendency of such cases filed, or if disposed, the decisions of such cases to be enclosed.',
            self::FORM_IV_PRIOR_PROCEEDINGS => 'In case the applicant has previously filed any such application, writ petition or suit, the details of the pendency of such cases filed; or if disposed, the decisions of such cases to be enclosed.',
            self::FORM_V_PRIOR_PROCEEDINGS => 'In case the appellant has previously filed any such application, writ petition or suit, the details of the pendency of such cases filed, or if disposed, the decisions of such cases to be enclosed.',
            self::FORM_VI_PRIOR_PROCEEDINGS => 'In case the appellant has previously filed any such application, writ petition or suit, the details of the pendency of such cases filed; or if disposed, the decisions of such cases to be enclosed.',
        ];
    }

    public static function branchTextFor(string $fieldId): string
    {
        return self::branchText()[$fieldId] ?? '';
    }

    public static function textFor(string $fieldId): string
    {
        $text = self::text()[$fieldId] ?? null;
        if ($text === null) {
            throw new \InvalidArgumentException("Unknown declaration: {$fieldId}");
        }

        return $text;
    }

    /**
     * A clause template with its blanks filled.
     *
     * Substitution only: no code path here can reorder or reword the sentence, which is the
     * property that makes a stored snapshot worth having. Keys are the placeholder names without
     * the leading colon.
     *
     * A placeholder left unfilled would end up inside a sworn sentence as the literal text
     * ":address", so that is an error rather than something to paper over.
     */
    public static function fill(string $fieldId, array $blanks): string
    {
        $map = [];
        foreach ($blanks as $name => $value) {
            $map[':' . $name] = (string) $value;
        }

        $filled = strtr(self::textFor($fieldId), $map);

        if (preg_match('/:[a-z_]+/', $filled, $leftover)) {
            throw new \InvalidArgumentException(
                "Clause {$fieldId} has no value for placeholder {$leftover[0]}"
            );
        }

        return $filled;
    }

    public static function provisionsFor(string $fieldId): array
    {
        return self::provisions()[$fieldId] ?? [];
    }
}
