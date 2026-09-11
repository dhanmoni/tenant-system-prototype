<?php

namespace App\Support;

use App\Constants\Declarations;

/**
 * The recital that opens Form I-B, and the fee undertaking that closes it.
 *
 * Form I-B is not built from numbered paragraphs like Forms II to VI. It is two sentences: one the
 * applicant completes about themselves and the premises, and one free-standing undertaking to bear
 * the valuer's fee. Both are things the applicant asserts, so both are recorded, and the completed
 * recital is composed here rather than accepted from the browser.
 *
 * The fields it draws on already existed on the form; this class only gives them the shape the
 * printed sentence needs, and the wording that goes on the record.
 */
class ValuerApplication
{
    /** As printed on p.4182. The filer strikes out two; here they pick one. */
    public const RELATIONS = ['Son', 'Daughter', 'Spouse'];

    /** "landlord or tenant of premises situated at" - again a pair to strike one of. */
    public const CAPACITIES = ['landlord', 'tenant'];

    /**
     * The blanks, ready to substitute into the template.
     *
     * Takes the request data the form already sends, so the recital and the stored columns cannot
     * describe two different people.
     */
    public static function blanks(array $data): array
    {
        return [
            'name' => trim((string) $data['applicant_name']),
            'relation' => ucfirst(strtolower((string) $data['applicant_relation_type'])),
            'relative_name' => trim((string) $data['applicant_relation_target_name']),
            'residence' => trim((string) $data['applicant_resident_place']),
            'capacity' => strtolower((string) $data['applicant_landlord_or_tenant']),
            'premises' => trim((string) $data['premises_situated_address']),
            'district' => trim((string) $data['district']),
        ];
    }

    /** The completed recital, exactly as made. */
    public static function compose(array $data): string
    {
        return Declarations::fill(Declarations::FORM_IB_APPLICATION, self::blanks($data));
    }
}
