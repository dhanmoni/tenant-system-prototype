<?php

namespace App\Services;

use App\Constants\Declarations;
use App\Models\FilingAttestation;
use App\Support\Verification;
use Carbon\Carbon;
use Illuminate\Http\Request;

/**
 * Writes the record of a sworn declaration accepted on a service form.
 *
 * The snapshot is taken from App\Constants\Declarations, never from the request. A filer can only
 * accept or decline the declaration; they cannot supply its wording, so trusting the client with
 * the text would let the record be forged.
 *
 * The VERIFICATION clause of Forms II to VI has blanks in it, so its snapshot is composed rather
 * than copied - but composed here, from the same constant, by substituting values the filer
 * supplied into the Gazette sentence. The client still never sends prose.
 */
class AttestationRecorder
{
    /**
     * @param  string  $applicationType  Slug from App\Constants\ApplicationTypes.
     * @param  int  $applicationId       Id of the filing row.
     * @param  string  $fieldId          A constant from App\Constants\Declarations.
     * @param  array|null  $values       The blanks, for a declaration that has any. Structured, and
     *                                   used to compose the snapshot; never prose from the client.
     */
    public function record(
        Request $request,
        string $applicationType,
        int $applicationId,
        string $fieldId,
        ?array $values = null
    ): FilingAttestation {
        return FilingAttestation::create([
            'application_type' => $applicationType,
            'application_id' => $applicationId,
            'field_id' => $fieldId,
            'text_snapshot' => $values === null
                ? Declarations::textFor($fieldId)
                : Declarations::fill($fieldId, $this->blanksFor($fieldId, $values)),
            'provision_refs' => Declarations::provisionsFor($fieldId),
            'values' => $values,
            'accepted' => true,
            'accepted_at' => Carbon::now(),
            'accepted_by_user_id' => $request->user()?->id,
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 512),
        ]);
    }

    /**
     * Turn the stored values of a clause into the blanks its sentence takes.
     *
     * Explicit per clause rather than a guess: a declaration handed values it does not know what to
     * do with would otherwise be snapshotted with its placeholders still in it, and that snapshot is
     * the record of what somebody swore.
     */
    private function blanksFor(string $fieldId, array $values): array
    {
        return match (true) {
            // Form I-B's recital has no derived blanks - its values are already the sentence's.
            $fieldId === Declarations::FORM_IB_APPLICATION => $values,

            str_ends_with($fieldId, '.verification') => Verification::blanks($values),

            default => throw new \InvalidArgumentException(
                "Declaration {$fieldId} does not take values"
            ),
        };
    }
}
