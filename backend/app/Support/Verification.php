<?php

namespace App\Support;

use App\Constants\Declarations;

/**
 * The VERIFICATION clause that closes Forms II to VI.
 *
 * The Gazette prints one continuous sworn sentence with blanks:
 *
 *   "I, ....(Name of the Applicant) S/o. / W/o. / D/o.... aged....residing at...., do hereby verify
 *    that the contents of paras .... to .... are true to my personal knowledge and paras .... to
 *    .... believed to be true on legal advice received and I hereby declare that I have not
 *    suppressed any material facts."
 *
 * Two things follow from it being a sentence rather than a set of fields.
 *
 * First, the filer has to be able to read what they are swearing, so the browser renders the
 * sentence with the blanks inline. This class holds the parts that decides.
 *
 * Second, the completed sentence is composed here, on the server, from the template in
 * App\Constants\Declarations and the values the filer supplied. The client never sends prose. That
 * is the rule AttestationRecorder already follows for paragraphs 2 and 5, and it matters more here:
 * under s. 36(2) of the Act (reaching the Rent Authority through s. 31) these are judicial
 * proceedings for ss. 193, 228 and 196 IPC, so a forged verification is not a cosmetic problem.
 */
class Verification
{
    /** The relations the Gazette prints, as printed. The filer strikes out two; here they pick one. */
    public const RELATIONS = ['S/o.', 'W/o.', 'D/o.'];

    /** What the filer asserts about a paragraph. */
    public const PERSONAL_KNOWLEDGE = 'personal_knowledge';
    public const LEGAL_ADVICE = 'legal_advice';
    public const NOT_VERIFIED = 'not_verified';

    /**
     * The paragraphs a filer may assign, per form, under the Gazette's own headings.
     *
     * Paragraph 2 is excluded on every form because it is itself a sworn declaration, attested
     * separately. On Forms II/III/V/VI, paragraph 5 is likewise excluded (its own declaration) and
     * paragraph 8 is omitted (enclosure list asserts no fact). Form IV additionally offers 5, 7 and
     * 8 so those particulars can be marked as based on legal advice when they apply.
     */
    public static function paragraphs(string $fieldId): array
    {
        $shared = [
            6 => 'Relief sought',
            7 => 'Interim order, if any prayed for',
        ];

        $application = [
            3 => 'Facts of the case',
            4 => 'Grounds for relief',
        ];

        // Forms V and VI have no "Facts of the case": paragraph 3 is Limitation and paragraph 4 is
        // the Memorandum of Appeal.
        $appeal = [
            3 => 'Limitation',
            4 => 'Memorandum of Appeal',
        ];

        $byForm = [
            Declarations::FORM_II_VERIFICATION => [1 => 'Particulars of application'] + $application + $shared,
            Declarations::FORM_III_VERIFICATION => [1 => 'Particulars of application'] + $application + $shared,
            Declarations::FORM_IV_VERIFICATION => [
                1 => 'Particulars of violation against which the present application is made',
                5 => 'Earlier proceedings',
                8 => 'List of enclosures',
            ] + $application + $shared,
            Declarations::FORM_V_VERIFICATION => [1 => 'Particulars of the order of the Rent Authority as against which the appeal is made'] + $appeal + $shared,
            Declarations::FORM_VI_VERIFICATION => [1 => 'Particulars of the order of the Rent Court as against which the Appeal is made'] + $appeal + $shared,
        ];

        if (!isset($byForm[$fieldId])) {
            throw new \InvalidArgumentException("No verification paragraphs defined for: {$fieldId}");
        }

        $paragraphs = $byForm[$fieldId];
        ksort($paragraphs);

        return $paragraphs;
    }

    /**
     * Validation rules for the blanks.
     *
     * The date is absent on purpose. In an online filing the date of verification is the moment of
     * submission, so the server stamps it; accepting one from the client would let a verification
     * be back-dated, which bears directly on the limitation paragraph of Forms V and VI.
     */
    public static function rules(string $fieldId): array
    {
        return [
            'verification_name' => ['required', 'string', 'max:255'],
            'verification_relation' => ['required', 'string', 'in:' . implode(',', self::RELATIONS)],
            'verification_relative_name' => ['required', 'string', 'max:255'],
            'verification_age' => ['required', 'integer', 'min:1', 'max:120'],
            'verification_address' => ['required', 'string', 'max:1000'],
            'verification_place' => ['required', 'string', 'max:255'],

            // One entry per assignable paragraph. Absent means the filer verified nothing about it,
            // which the printed form allows - the two blanks need not cover every paragraph.
            'verification_paragraphs' => ['array'],
            'verification_paragraphs.*' => [
                'string',
                'in:' . implode(',', [self::PERSONAL_KNOWLEDGE, self::LEGAL_ADVICE, self::NOT_VERIFIED]),
            ],
        ];
    }

    /**
     * Split the filer's per-paragraph answers into the two sets the sentence names.
     *
     * @return array{personal: int[], advised: int[]}
     */
    public static function paragraphSets(string $fieldId, array $data): array
    {
        $answers = $data['verification_paragraphs'] ?? [];
        $personal = [];
        $advised = [];

        foreach (array_keys(self::paragraphs($fieldId)) as $number) {
            $answer = $answers[$number] ?? ($answers[(string) $number] ?? null);
            if ($answer === self::PERSONAL_KNOWLEDGE) {
                $personal[] = $number;
            } elseif ($answer === self::LEGAL_ADVICE) {
                $advised[] = $number;
            }
        }

        return ['personal' => $personal, 'advised' => $advised];
    }

    /**
     * A verification that asserts nothing of the filer's own knowledge asserts nothing at all, so
     * at least one paragraph must be verified that way. The legal-advice set may be empty: most
     * filers act without a lawyer, and the printed form does not require both blanks to be used.
     */
    public static function personalKnowledgeIsEmpty(string $fieldId, array $data): bool
    {
        return self::paragraphSets($fieldId, $data)['personal'] === [];
    }

    /**
     * Render one set of paragraph numbers the way the blank expects to be filled.
     *
     * The Gazette prints "paras .... to ....", which assumes the set is a contiguous run. Real
     * filings are not always: a filer may know paragraphs 1, 3 and 4 of their own knowledge and
     * plead 6 on advice. Rather than force a false contiguity, a broken set is written out as a
     * list. An empty set is "nil" - what gets written on a paper form, and what keeps the sentence
     * whole rather than leaving a hole in a sworn statement.
     *
     * See docs/gazette-divergences.md items F1 and F2.
     */
    public static function renderParagraphs(array $numbers): string
    {
        $numbers = array_values(array_unique(array_map('intval', $numbers)));
        sort($numbers);

        $count = count($numbers);
        if ($count === 0) {
            return 'nil';
        }
        if ($count === 1) {
            return (string) $numbers[0];
        }

        if (($numbers[$count - 1] - $numbers[0]) === $count - 1) {
            return $numbers[0] . ' to ' . $numbers[$count - 1];
        }

        $last = array_pop($numbers);

        return implode(', ', $numbers) . ' and ' . $last;
    }

    /**
     * The values recorded against the filing, ready to substitute into the template.
     */
    public static function normalise(string $fieldId, array $data): array
    {
        $sets = self::paragraphSets($fieldId, $data);

        return [
            'name' => trim((string) $data['verification_name']),
            'relation' => $data['verification_relation'],
            'relative_name' => trim((string) $data['verification_relative_name']),
            'age' => (int) $data['verification_age'],
            'address' => trim((string) $data['verification_address']),
            'place' => trim((string) $data['verification_place']),
            'personal_knowledge_paras' => $sets['personal'],
            'legal_advice_paras' => $sets['advised'],
        ];
    }

    /**
     * The completed sentence, exactly as sworn.
     *
     * Built from the Gazette template by substitution alone. No code path here can reorder or
     * reword the sentence, which is the property that makes the stored snapshot worth having.
     */
    public static function compose(string $fieldId, array $values): string
    {
        return Declarations::fill($fieldId, self::blanks($values));
    }

    /**
     * The stored values flattened into the blanks the sentence takes.
     *
     * This is where the two paragraph sets stop being arrays and become the text that goes in the
     * two printed gaps. Kept separate from compose() so the recorder can fill any clause the same
     * way, whatever its blanks are.
     */
    public static function blanks(array $values): array
    {
        return [
            'name' => $values['name'],
            'relation' => $values['relation'],
            'relative_name' => $values['relative_name'],
            'age' => (string) $values['age'],
            'address' => $values['address'],
            'personal_paras' => self::renderParagraphs($values['personal_knowledge_paras'] ?? []),
            'advised_paras' => self::renderParagraphs($values['legal_advice_paras'] ?? []),
        ];
    }
}
