<?php

namespace App\Support;

use App\Constants\Enclosures as EnclosureKinds;
use App\Constants\PriorProceedingStatus;
use App\Models\FilingEnclosure;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;

/**
 * Collecting the documents filed with a service form.
 *
 * The paragraph headed "List of enclosures" was a prose textarea. A filing could therefore assert
 * "1. Certified copy of the order of the Rent Court" with nothing attached, and on Form VI that is
 * the difference between an appeal that is competent under rule 13(3) and one that is not. This
 * class takes the files instead, and derives the printed list from what was actually attached.
 *
 * Which documents are named, and which of them gate a filing, is settled in
 * App\Constants\Enclosures from the provisions. Two obligations arise here rather than there,
 * because they depend on what the filer answered:
 *
 *   - paragraph 5 of Forms II to VI requires the decision in every prior proceeding the filer
 *     discloses as disposed of, so the required set is one document per such entry;
 *   - nothing else is required unless the Rules make the filing conditional on it.
 */
class Enclosures
{
    /** Per file. Large enough for a scanned certified order, small enough to refuse a video. */
    public const MAX_KILOBYTES = 10240;

    /** Across one filing. */
    public const MAX_FILES = 25;

    public const MIME_TYPES = ['pdf', 'jpg', 'jpeg', 'png'];

    /**
     * Validation rules for the enclosure block.
     *
     * The files arrive as `enclosures[n][file]` with `enclosures[n][kind]` and, for OTHER, a
     * `label`. Requiredness is not expressed here: a rule like `required_if` cannot see the
     * paragraph 5 answers, and a missing prescribed document deserves a message that names the
     * document and the provision. assertRequiredPresent() does that instead.
     */
    public static function rules(string $applicationType): array
    {
        $kinds = implode(',', EnclosureKinds::kindsFor($applicationType));

        return [
            'enclosures' => ['array', 'max:' . self::MAX_FILES],
            'enclosures.*.kind' => ['required', 'string', 'in:' . $kinds],
            'enclosures.*.label' => ['nullable', 'string', 'max:255'],
            'enclosures.*.prior_proceeding_index' => ['nullable', 'integer', 'min:0'],
            'enclosures.*.file' => [
                'required',
                'file',
                'mimes:' . implode(',', self::MIME_TYPES),
                'max:' . self::MAX_KILOBYTES,
            ],
        ];
    }

    /**
     * Every document this filing cannot be made without, as `kind` => label.
     *
     * Keyed so a caller can report each one by name. A paragraph 5 decision is keyed by its entry
     * index as well, because one filing may owe several of them.
     */
    public static function requiredFor(string $applicationType, ?array $priorProceedings): array
    {
        $required = [];

        foreach (EnclosureKinds::requiredFor($applicationType) as $slot) {
            $required[$slot['kind']] = $slot['label'];
        }

        foreach (self::priorProceedingSlots($priorProceedings) as $index => $label) {
            $required[EnclosureKinds::PRIOR_PROCEEDING_DECISION . '.' . $index] = $label;
        }

        return $required;
    }

    /**
     * The paragraph 5 decisions this filing owes, as entry index => label.
     *
     * Only disposed entries. Where a case is still pending the form asks for "the details of the
     * pendency", which is text the filer types, not a document.
     */
    public static function priorProceedingSlots(?array $priorProceedings): array
    {
        $slots = [];

        foreach ($priorProceedings ?? [] as $index => $entry) {
            if (($entry['status'] ?? null) !== PriorProceedingStatus::DISPOSED) {
                continue;
            }

            $slots[$index] = EnclosureKinds::priorProceedingLabel(
                (string) ($entry['case_number'] ?? ''),
                (string) ($entry['forum'] ?? '')
            );
        }

        return $slots;
    }

    /**
     * Refuse the filing if a document the Rules make it conditional on is missing.
     *
     * Thrown as a validation error against `enclosures` so it surfaces beside the block the filer
     * has to fix, and the message names the document rather than saying "an enclosure is required".
     */
    public static function assertRequiredPresent(
        string $applicationType,
        array $submitted,
        ?array $priorProceedings
    ): void {
        $present = [];
        foreach ($submitted as $entry) {
            $kind = $entry['kind'] ?? null;
            $present[] = $kind === EnclosureKinds::PRIOR_PROCEEDING_DECISION
                ? $kind . '.' . (int) ($entry['prior_proceeding_index'] ?? -1)
                : $kind;
        }

        $missing = [];
        foreach (self::requiredFor($applicationType, $priorProceedings) as $key => $label) {
            if (!in_array($key, $present, true)) {
                $missing[] = $label;
            }
        }

        if ($missing === []) {
            return;
        }

        throw ValidationException::withMessages([
            'enclosures' => array_map(
                static fn (string $label) => $label . ' must be enclosed with this filing.',
                $missing
            ),
        ]);
    }

    /**
     * Write the uploaded files and return the rows.
     *
     * Labels come from App\Constants\Enclosures for a prescribed kind and from the filer only for
     * OTHER, so a submission cannot dress an arbitrary file up as the certified order - the same
     * reasoning that keeps declaration text off the request. See [[declarations-are-snapshotted]]
     * in the project notes and App\Constants\Declarations.
     */
    public static function store(
        Request $request,
        string $applicationType,
        $applicationId,
        ?array $priorProceedings
    ): array {
        $rows = [];
        $slots = self::priorProceedingSlots($priorProceedings);

        foreach ((array) $request->input('enclosures', []) as $index => $entry) {
            $file = $request->file("enclosures.{$index}.file");
            if (!$file instanceof UploadedFile) {
                continue;
            }

            $kind = (string) ($entry['kind'] ?? EnclosureKinds::OTHER);
            $priorIndex = isset($entry['prior_proceeding_index'])
                ? (int) $entry['prior_proceeding_index']
                : null;

            [$label, $provisionRefs] = self::labelFor($applicationType, $kind, $priorIndex, $slots, $entry);

            $rows[] = FilingEnclosure::create([
                'application_type' => $applicationType,
                'application_id' => $applicationId,
                'kind' => $kind,
                'label' => $label,
                'provision_refs' => $provisionRefs,
                'prior_proceeding_index' => $kind === EnclosureKinds::PRIOR_PROCEEDING_DECISION
                    ? $priorIndex
                    : null,
                'file_path' => DocumentStore::store($file, 'tenancy/enclosures/' . $applicationType),
                'original_name' => mb_substr((string) $file->getClientOriginalName(), 0, 255),
                'mime_type' => $file->getClientMimeType(),
                'size_bytes' => $file->getSize(),
                'uploaded_by_user_id' => $request->user()?->id,
                'uploaded_at' => now(),
            ]);
        }

        return $rows;
    }

    /**
     * The label and provisions to record, as [label, provision_refs].
     *
     * A prescribed kind takes both from the registry. A paragraph 5 decision takes its label from
     * the entry it answers. Only OTHER lets the filer name the document, and even then the name is
     * theirs while the kind stays OTHER.
     */
    private static function labelFor(
        string $applicationType,
        string $kind,
        ?int $priorIndex,
        array $slots,
        array $entry
    ): array {
        if ($kind === EnclosureKinds::PRIOR_PROCEEDING_DECISION) {
            return [
                $slots[$priorIndex] ?? 'Decision in a previously filed case',
                EnclosureKinds::PRIOR_PROCEEDING_PROVISIONS,
            ];
        }

        $definition = EnclosureKinds::definition($applicationType, $kind);
        if ($definition) {
            return [$definition['label'], $definition['provision_refs']];
        }

        $given = trim((string) ($entry['label'] ?? ''));

        return [$given !== '' ? mb_substr($given, 0, 255) : 'Enclosure', null];
    }

    /**
     * The paragraph 8 list, derived from what was actually attached.
     *
     * Replaces the prose the filer used to type. Numbered the way the printed form numbers it, so
     * the rendered filing reads as the Gazette sets it out.
     */
    public static function summarise(array $rows): string
    {
        if ($rows === []) {
            return 'None.';
        }

        $lines = [];
        foreach (array_values($rows) as $i => $row) {
            $label = $row instanceof FilingEnclosure ? $row->label : (string) ($row['label'] ?? '');
            $lines[] = sprintf('%d. %s', $i + 1, $label);
        }

        return implode("\n", $lines);
    }
}
