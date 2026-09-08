<?php

namespace App\Support;

use App\Models\TenancyApplication;
use App\Models\User;

/**
 * Rule 4(4) of the Assam Tenancy Rules, 2025.
 *
 * "The details of the tenancy including the cases of renewal, extension, addendum, supplementary
 * agreement and other related application by Parties through digital platform, shall be accessible
 * to concerned Parties only and to the person authorized by Rent Authority. Under any
 * circumstances, such information shall not be accessible to public or any unauthorised person."
 *
 * Rule 2(i) fixes who a "Party" is: "the landlord or tenant ... who enter into the tenancy
 * agreement". So being signed in is not enough to read a tenancy - the account must belong to a
 * party on that particular record.
 *
 * The second limb of Rule 4(4) - "the person authorized by Rent Authority" - is deliberately not
 * implemented here. Nothing in the system currently records such an authorisation, and Rule 4(4)
 * closes by forbidding access to "any unauthorised person", so the safe reading is to deny until
 * an authorisation exists to check against. Two known consequences, both of which need a
 * representation model before they can be served:
 *
 *   - Rule 7 lets the legal heirs of a deceased landlord apply to the Rent Court. An heir is not
 *     on the tenancy record and cannot look it up.
 *   - Rule 9 lets a party authorise a representative or legal practitioner. That representative
 *     cannot look the tenancy up under their own account.
 *
 * See docs/statutory-forms-engine-plan.md.
 */
class TenancyAccess
{
    /**
     * The single answer given whenever a tenancy may not be disclosed, whatever the reason.
     *
     * A wrong UIN, a UIN belonging to somebody else and a UIN whose record is not disclosable all
     * produce this one string. Distinguishing them would let a signed-in account walk the UIN space
     * and learn which numbers exist - the sequential format ATRMS-<district><circle><year>-NNNN
     * makes that cheap - which is exactly what Rule 4(4) forbids.
     */
    public const NOT_AVAILABLE = 'No tenancy record is available for this UIN under your account. Check the UIN, and note that tenancy details can only be fetched by a party to that tenancy.';

    /**
     * The same answer for a tenancy addressed by its application number.
     *
     * Every route under /api/tenancy-applications/{applicationNo} used to answer 403 for a real
     * record the account may not see and 404 for a number that does not exist. Those two answers
     * are a directory: application numbers run APP-YYYYMM-NNNNNN, so walking them told any
     * signed-in account exactly which applications had been filed and when - the enumeration
     * Rule 4(4) forbids, arrived at without reading a single record.
     *
     * Both cases now answer 404 with this string. App\Exceptions\Handler gives route-model
     * binding the same body, so a miss in the router and a refusal in the controller are one
     * response.
     */
    public const APPLICATION_NOT_AVAILABLE = 'No tenancy record is available for this application number under your account. Check the number, and note that tenancy details are available only to a party to that tenancy and to the office handling it.';

    /**
     * Is this account a party to this tenancy?
     */
    public static function isConcernedParty(TenancyApplication $tenancy, ?User $user): bool
    {
        if (!$user) {
            return false;
        }

        // The two parties, plus the account that filed the First Schedule intimation - which is one
        // of the parties, or the property manager acting for the landlord.
        foreach (['landlord_user_id', 'tenant_user_id', 'user_id'] as $column) {
            if ($tenancy->{$column} && (int) $tenancy->{$column} === (int) $user->id) {
                return true;
            }
        }

        // Records filed before the party columns were linked to accounts carry the parties only as
        // the contact details given on the intimation. Rule 4(5) has those same numbers and
        // addresses validated by OTP at submission, so a match is evidence of party membership.
        $userPhone = self::normalisePhone($user->phone);
        $userEmail = trim((string) $user->email);

        foreach (['landlord', 'tenant', 'manager'] as $party) {
            $phone = self::normalisePhone($tenancy->{$party . '_phone'});
            if ($userPhone !== '' && $phone !== '' && $phone === $userPhone) {
                return true;
            }

            $email = trim((string) $tenancy->{$party . '_email'});
            if ($userEmail !== '' && $email !== '' && strcasecmp($email, $userEmail) === 0) {
                return true;
            }
        }

        return false;
    }

    /**
     * Reduce a phone number to the ten digits that identify the subscriber.
     *
     * The intimation and the account registration are two separate typings of one number, and one
     * of them may carry the country code, a leading zero or spacing. A party must not be refused
     * their own tenancy over "+91 90000 00001" versus "9000000001".
     *
     * A prefix is only stripped when doing so leaves exactly ten digits, the length of an Indian
     * subscriber number. That is what protects a number whose own first digits are 91 - 9101424242
     * is already ten digits long, so nothing is taken off it. A looser "starts with 91" rule would
     * eventually eat the front of a real number and refuse its owner their own tenancy.
     *
     * Anything that is not recognisably one of these shapes is left exactly as dialled and compared
     * whole, so an unusual number can still match itself.
     *
     * Note this is deliberately stricter than TenancyApplication::generateRefCode, which uses a
     * plain "longer than ten and starts with 91" rule. That one feeds a hash and must not change:
     * altering it would derive different reference codes than the ones already issued.
     */
    private static function normalisePhone($phone): string
    {
        $digits = preg_replace('/[^0-9]/', '', (string) $phone);
        $length = strlen($digits);

        // +91 XXXXXXXXXX
        if ($length === 12 && str_starts_with($digits, '91')) {
            return substr($digits, 2);
        }

        // 0 91 XXXXXXXXXX
        if ($length === 13 && str_starts_with($digits, '091')) {
            return substr($digits, 3);
        }

        // 0 XXXXXXXXXX - the STD trunk prefix
        if ($length === 11 && str_starts_with($digits, '0')) {
            return substr($digits, 1);
        }

        return $digits;
    }
}
