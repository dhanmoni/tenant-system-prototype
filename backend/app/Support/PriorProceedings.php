<?php

namespace App\Support;

use App\Constants\PriorProceedingStatus;

/**
 * The affirmative branch of paragraph 5 on Forms II to VI.
 *
 * Where the filer cannot make the negative declaration, the printed form requires "the details of
 * the pendency of such cases filed, or if disposed, the decisions of such cases to be enclosed".
 * Two different things are asked for depending on status, which is why an entry carries both a
 * pendency field and a decision field and requires exactly one of them.
 */
class PriorProceedings
{
    /** Validation rules for the branch, shared by all five forms. */
    public static function rules(): array
    {
        return [
            'has_prior_proceedings' => ['required', 'boolean'],

            'prior_proceedings' => ['array', 'required_if:has_prior_proceedings,1', 'max:20'],
            'prior_proceedings.*.case_number' => ['required', 'string', 'max:128'],
            'prior_proceedings.*.forum' => ['required', 'string', 'max:255'],
            'prior_proceedings.*.filing_date' => ['nullable', 'date'],
            'prior_proceedings.*.status' => [
                'required',
                'string',
                'in:' . implode(',', PriorProceedingStatus::all()),
            ],
            // "the details of the pendency of such cases filed..."
            'prior_proceedings.*.pendency_details' => [
                'nullable',
                'string',
                'max:2000',
                'required_if:prior_proceedings.*.status,' . PriorProceedingStatus::PENDING,
            ],
            // "...or if disposed, the decisions of such cases to be enclosed."
            'prior_proceedings.*.decision' => [
                'nullable',
                'string',
                'max:2000',
                'required_if:prior_proceedings.*.status,' . PriorProceedingStatus::DISPOSED,
            ],
        ];
    }

    /**
     * The entries to store, or null where the filer made the negative declaration.
     *
     * Anything posted alongside a "no" answer is dropped: a filing that declares there are no prior
     * proceedings must not also carry a list of them.
     */
    public static function normalise(array $data): ?array
    {
        if (empty($data['has_prior_proceedings'])) {
            return null;
        }

        $entries = [];
        foreach ($data['prior_proceedings'] ?? [] as $entry) {
            $status = $entry['status'];
            $entries[] = [
                'case_number' => trim((string) $entry['case_number']),
                'forum' => trim((string) $entry['forum']),
                'filing_date' => $entry['filing_date'] ?? null,
                'status' => $status,
                'pendency_details' => $status === PriorProceedingStatus::PENDING
                    ? trim((string) ($entry['pendency_details'] ?? ''))
                    : null,
                'decision' => $status === PriorProceedingStatus::DISPOSED
                    ? trim((string) ($entry['decision'] ?? ''))
                    : null,
            ];
        }

        return $entries;
    }

    /**
     * A human-readable rendering for the legacy free-text column, so admin views and printed output
     * that read that column keep showing something meaningful.
     */
    public static function summarise(?array $entries, string $negativeDeclaration): string
    {
        if ($entries === null) {
            return $negativeDeclaration;
        }

        $lines = [];
        foreach ($entries as $i => $entry) {
            $line = sprintf('%d. %s before %s', $i + 1, $entry['case_number'], $entry['forum']);
            if (!empty($entry['filing_date'])) {
                $line .= sprintf(' (filed %s)', $entry['filing_date']);
            }
            $line .= $entry['status'] === PriorProceedingStatus::DISPOSED
                ? ' - disposed: ' . $entry['decision']
                : ' - pending: ' . $entry['pendency_details'];
            $lines[] = $line;
        }

        return implode("\n", $lines);
    }

    /**
     * Enclosures the form calls for: the decision in every disposed case. Appended to the
     * paragraph 8 list so that what has to be enclosed is stated on the filing itself.
     *
     * Note that this records the requirement, it does not collect the document. File storage for
     * enclosures does not exist on these forms yet - see docs/statutory-forms-engine-plan.md.
     */
    public static function enclosureLines(?array $entries): array
    {
        if ($entries === null) {
            return [];
        }

        $lines = [];
        foreach ($entries as $entry) {
            if ($entry['status'] === PriorProceedingStatus::DISPOSED) {
                $lines[] = sprintf(
                    'Decision in %s before %s (to be enclosed)',
                    $entry['case_number'],
                    $entry['forum']
                );
            }
        }

        return $lines;
    }

    /** Append the required enclosures to whatever the filer listed at paragraph 8. */
    public static function appendEnclosures(?string $existing, ?array $entries): ?string
    {
        $lines = self::enclosureLines($entries);
        if ($lines === []) {
            return $existing;
        }

        $existing = trim((string) $existing);

        return $existing === ''
            ? implode("\n", $lines)
            : $existing . "\n" . implode("\n", $lines);
    }
}
