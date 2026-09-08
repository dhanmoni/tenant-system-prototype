<?php

namespace Tests\Unit;

use App\Constants\Declarations;
use App\Support\Verification;
use PHPUnit\Framework\TestCase;

/**
 * The VERIFICATION clause is sworn under s. 36(2) of the Act, so two things have to hold: the
 * sentence a filer swears must be reproducible verbatim, and it must say what they actually chose.
 * These tests pin both, plus the paragraph arithmetic the filer no longer does by hand.
 *
 * No database access, so this is safe to run against any environment.
 */
class VerificationTest extends TestCase
{
    private const FORMS = [
        Declarations::FORM_II_VERIFICATION,
        Declarations::FORM_III_VERIFICATION,
        Declarations::FORM_IV_VERIFICATION,
        Declarations::FORM_V_VERIFICATION,
        Declarations::FORM_VI_VERIFICATION,
    ];

    private function data(array $paragraphs = [], array $overrides = []): array
    {
        return array_merge([
            'verification_name' => 'John Doe',
            'verification_relation' => 'S/o.',
            'verification_relative_name' => 'Ramesh Das',
            'verification_age' => '45',
            'verification_address' => 'House 12, Zoo Road, Guwahati',
            'verification_place' => 'Guwahati',
            'verification_paragraphs' => $paragraphs,
        ], $overrides);
    }

    public function test_every_form_has_a_verification_with_text_and_provisions(): void
    {
        foreach (self::FORMS as $fieldId) {
            $this->assertNotSame('', trim(Declarations::textFor($fieldId)), "{$fieldId} has no text");
            $this->assertNotEmpty(
                Declarations::provisionsFor($fieldId),
                "{$fieldId} cites no provision"
            );
            $this->assertNotEmpty(Verification::paragraphs($fieldId));
        }
    }

    /**
     * The sentence is what is sworn. If a placeholder is renamed on one side only, compose() leaves
     * the raw token in the oath, so every placeholder is checked to have been consumed.
     */
    public function test_the_composed_sentence_is_the_gazette_sentence_with_the_blanks_filled(): void
    {
        $fieldId = Declarations::FORM_II_VERIFICATION;
        $values = Verification::normalise($fieldId, $this->data([
            3 => Verification::PERSONAL_KNOWLEDGE,
            4 => Verification::PERSONAL_KNOWLEDGE,
            6 => Verification::LEGAL_ADVICE,
        ]));

        $sentence = Verification::compose($fieldId, $values);

        $this->assertSame(
            'I, John Doe S/o. Ramesh Das aged 45 residing at House 12, Zoo Road, Guwahati, do hereby '
            . 'verify that the contents of paras 3 to 4 are true to my personal knowledge and paras 6 '
            . 'believed to be true on legal advice received and I hereby declare that I have not '
            . 'suppressed any material facts.',
            $sentence
        );

        $this->assertStringNotContainsString(':', $sentence, 'an unfilled placeholder survived');
    }

    /**
     * The operative half. It is the clause with consequences, it was missing from the form
     * altogether before this existed, and nothing in the template may quietly drop it again.
     */
    public function test_the_no_suppression_declaration_is_part_of_every_verification(): void
    {
        foreach (self::FORMS as $fieldId) {
            $this->assertStringContainsString(
                'I have not suppressed any material facts',
                Declarations::textFor($fieldId),
                "{$fieldId} does not carry the no-suppression declaration"
            );
        }
    }

    public function test_contiguous_paragraphs_are_rendered_as_the_printed_range(): void
    {
        $this->assertSame('3 to 7', Verification::renderParagraphs([3, 4, 5, 6, 7]));
        $this->assertSame('1 to 2', Verification::renderParagraphs([2, 1]));
    }

    /**
     * The printed blank assumes contiguity. Forcing a broken set into "1 to 6" would make the filer
     * swear to paragraphs they did not choose, so it is written out instead. Divergence F1.
     */
    public function test_a_broken_set_is_written_out_rather_than_forced_into_a_range(): void
    {
        $this->assertSame('1, 4 and 6', Verification::renderParagraphs([1, 4, 6]));
        $this->assertSame('1 and 6', Verification::renderParagraphs([6, 1]));
    }

    public function test_a_single_paragraph_and_an_empty_set_still_fill_the_blank(): void
    {
        $this->assertSame('4', Verification::renderParagraphs([4]));
        // Divergence F2: a hole in a sworn sentence is worse than the word written on paper.
        $this->assertSame('nil', Verification::renderParagraphs([]));
    }

    public function test_duplicate_paragraph_numbers_collapse(): void
    {
        $this->assertSame('3 to 4', Verification::renderParagraphs([3, 4, 4, 3]));
    }

    /**
     * A paragraph can be in one set or neither, never both - the two halves of the sentence would
     * contradict each other.
     */
    public function test_a_paragraph_lands_in_exactly_one_set(): void
    {
        $fieldId = Declarations::FORM_IV_VERIFICATION;
        $sets = Verification::paragraphSets($fieldId, $this->data([
            1 => Verification::PERSONAL_KNOWLEDGE,
            3 => Verification::LEGAL_ADVICE,
            4 => Verification::NOT_VERIFIED,
        ]));

        $this->assertSame([1], $sets['personal']);
        $this->assertSame([3], $sets['advised']);
        $this->assertSame([], array_intersect($sets['personal'], $sets['advised']));
    }

    /** Paragraph numbers arrive from a form post as strings. */
    public function test_paragraph_answers_keyed_by_string_are_honoured(): void
    {
        $sets = Verification::paragraphSets(Declarations::FORM_II_VERIFICATION, $this->data([
            '3' => Verification::PERSONAL_KNOWLEDGE,
            '6' => Verification::LEGAL_ADVICE,
        ]));

        $this->assertSame([3], $sets['personal']);
        $this->assertSame([6], $sets['advised']);
    }

    /**
     * A paragraph that is not on the form cannot be verified. Without this an extra key posted by
     * hand would appear in a sworn sentence as a paragraph that does not exist.
     */
    public function test_a_paragraph_the_form_does_not_have_is_ignored(): void
    {
        $sets = Verification::paragraphSets(Declarations::FORM_II_VERIFICATION, $this->data([
            3 => Verification::PERSONAL_KNOWLEDGE,
            2 => Verification::PERSONAL_KNOWLEDGE,
            5 => Verification::PERSONAL_KNOWLEDGE,
            8 => Verification::PERSONAL_KNOWLEDGE,
            99 => Verification::PERSONAL_KNOWLEDGE,
        ]));

        $this->assertSame([3], $sets['personal']);
    }

    public function test_a_verification_asserting_nothing_of_personal_knowledge_is_rejected(): void
    {
        $fieldId = Declarations::FORM_VI_VERIFICATION;

        $this->assertTrue(Verification::personalKnowledgeIsEmpty($fieldId, $this->data([])));
        $this->assertTrue(Verification::personalKnowledgeIsEmpty($fieldId, $this->data([
            3 => Verification::LEGAL_ADVICE,
            4 => Verification::NOT_VERIFIED,
        ])));
        $this->assertFalse(Verification::personalKnowledgeIsEmpty($fieldId, $this->data([
            3 => Verification::PERSONAL_KNOWLEDGE,
        ])));
    }

    /**
     * Forms V and VI have no "Facts of the case": paragraph 3 is Limitation and 4 the Memorandum.
     * Getting this wrong would name the wrong paragraph in a sworn sentence.
     */
    public function test_the_appeal_forms_carry_their_own_paragraph_headings(): void
    {
        foreach ([Declarations::FORM_V_VERIFICATION, Declarations::FORM_VI_VERIFICATION] as $fieldId) {
            $paragraphs = Verification::paragraphs($fieldId);
            $this->assertSame('Limitation', $paragraphs[3]);
            $this->assertSame('Memorandum of Appeal', $paragraphs[4]);
        }

        foreach ([Declarations::FORM_II_VERIFICATION, Declarations::FORM_III_VERIFICATION, Declarations::FORM_IV_VERIFICATION] as $fieldId) {
            $paragraphs = Verification::paragraphs($fieldId);
            $this->assertSame('Facts of the case', $paragraphs[3]);
            $this->assertSame('Grounds for relief', $paragraphs[4]);
        }
    }

    /**
     * Paragraphs 2 and 5 are sworn separately under their own wording, and 8 asserts no fact.
     * Offering them here would have a filer swear the same thing twice, two different ways.
     */
    public function test_the_separately_sworn_paragraphs_are_not_offered_for_verification(): void
    {
        foreach (self::FORMS as $fieldId) {
            $numbers = array_keys(Verification::paragraphs($fieldId));
            $this->assertSame([1, 3, 4, 6, 7], $numbers, "{$fieldId} offers the wrong paragraphs");
        }
    }

    /**
     * The paragraph headings exist twice: here, and in the browser's copy that labels the table the
     * filer answers. If they drift, a filer marks one paragraph and swears about another.
     *
     * The sworn sentence itself is covered by DeclarationsTest, which walks Declarations::text().
     */
    public function test_the_browser_copy_carries_the_same_paragraph_headings(): void
    {
        $mirror = __DIR__ . '/../../../frontend/src/constants/declarations.js';
        $this->assertFileExists($mirror);
        $js = file_get_contents($mirror);

        foreach (self::FORMS as $fieldId) {
            foreach (Verification::paragraphs($fieldId) as $number => $heading) {
                $this->assertStringContainsString(
                    $heading,
                    $js,
                    "declarations.js is missing paragraph {$number} of {$fieldId}: {$heading}"
                );
            }
        }
    }

    /**
     * Form I-B's recital. Same machinery, no paragraphs: its values are already the blanks.
     */
    public function test_the_form_ib_recital_composes_to_the_printed_sentence(): void
    {
        $blanks = \App\Support\ValuerApplication::blanks([
            'applicant_name' => '  Anita Sharma ',
            'applicant_relation_type' => 'daughter',
            'applicant_relation_target_name' => 'Mohan Sharma',
            'applicant_resident_place' => 'Beltola, Guwahati',
            'applicant_landlord_or_tenant' => 'Tenant',
            'premises_situated_address' => 'Shop 4, GS Road',
            'district' => 'Kamrup (Metro)',
        ]);

        $this->assertSame(
            'I, Anita Sharma Daughter of Mohan Sharma resident of Beltola, Guwahati , tenant of '
            . 'premises situated at Shop 4, GS Road District- Kamrup (Metro) , Assam hereby make '
            . 'this application to appoint the government recognized valuer to evaluate the rent '
            . 'and or other charges of the aforesaid premises.',
            Declarations::fill(Declarations::FORM_IB_APPLICATION, $blanks)
        );
    }

    /**
     * The fee undertaking is what rule 5(4) charges the valuer's fee against, so it has to be on
     * the record as its own thing rather than implied by the form having been submitted.
     */
    public function test_the_form_ib_undertaking_is_recorded_verbatim(): void
    {
        $this->assertSame(
            'I hereby agree to bear the fee of the valuer as determined by the Rent Authority.',
            Declarations::textFor(Declarations::FORM_IB_UNDERTAKING)
        );
        $this->assertContains('ATR2025.r5.4', Declarations::provisionsFor(Declarations::FORM_IB_UNDERTAKING));
    }

    /**
     * A blank left unfilled would otherwise reach the record as the literal text ":district" inside
     * a sentence somebody is taken to have made.
     */
    public function test_an_unfilled_blank_is_an_error_rather_than_reaching_the_record(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        Declarations::fill(Declarations::FORM_IB_APPLICATION, ['name' => 'Anita Sharma']);
    }

    public function test_an_unknown_form_is_rejected_rather_than_verifying_nothing(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        Verification::paragraphs('form_xi.verification');
    }

    /** Only the three printed relations, so the sentence cannot be filled with free text. */
    public function test_the_relation_is_limited_to_the_printed_alternatives(): void
    {
        $this->assertSame(['S/o.', 'W/o.', 'D/o.'], Verification::RELATIONS);

        $rules = Verification::rules(Declarations::FORM_II_VERIFICATION);
        $this->assertContains('in:S/o.,W/o.,D/o.', $rules['verification_relation']);
    }

    /** Divergence F3: the date is stamped, so it must never be accepted from the request. */
    public function test_no_rule_accepts_a_verification_date_from_the_client(): void
    {
        foreach (self::FORMS as $fieldId) {
            $this->assertArrayNotHasKey('verification_date', Verification::rules($fieldId));
            $this->assertArrayNotHasKey('verified_on', Verification::rules($fieldId));
        }
    }

    public function test_normalise_trims_and_types_the_values(): void
    {
        $values = Verification::normalise(
            Declarations::FORM_III_VERIFICATION,
            $this->data([3 => Verification::PERSONAL_KNOWLEDGE], [
                'verification_name' => '  John Doe  ',
                'verification_address' => "  House 12  ",
                'verification_age' => '45',
            ])
        );

        $this->assertSame('John Doe', $values['name']);
        $this->assertSame('House 12', $values['address']);
        $this->assertSame(45, $values['age']);
        $this->assertSame([3], $values['personal_knowledge_paras']);
        $this->assertSame([], $values['legal_advice_paras']);
    }
}
