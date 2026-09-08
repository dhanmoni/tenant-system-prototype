<?php

namespace Tests\Unit;

use App\Constants\Declarations;
use PHPUnit\Framework\TestCase;

/**
 * The declaration strings are legally load-bearing: they are what a filer accepts and what a filing
 * must reproduce years later. These tests guard them against three ways they could quietly rot -
 * being reworded, being "tidied", or drifting apart from the copy the browser displays.
 *
 * No database access, so this is safe to run against any environment.
 */
class DeclarationsTest extends TestCase
{
    private const JS_MIRROR = __DIR__ . '/../../../frontend/src/constants/declarations.js';

    public function test_every_declaration_has_text_and_provisions(): void
    {
        $ids = [
            Declarations::FORM_II_JURISDICTION,
            Declarations::FORM_III_JURISDICTION,
            Declarations::FORM_IV_JURISDICTION,
            Declarations::FORM_V_JURISDICTION,
            Declarations::FORM_VI_JURISDICTION,
            Declarations::FORM_II_PRIOR_PROCEEDINGS,
            Declarations::FORM_III_PRIOR_PROCEEDINGS,
            Declarations::FORM_IV_PRIOR_PROCEEDINGS,
            Declarations::FORM_V_PRIOR_PROCEEDINGS,
            Declarations::FORM_VI_PRIOR_PROCEEDINGS,
        ];

        foreach ($ids as $id) {
            $this->assertNotSame('', trim(Declarations::textFor($id)), "{$id} has no text");
            $this->assertNotEmpty(
                Declarations::provisionsFor($id),
                "{$id} cites no provision, so a filing could not be rendered against the law it rests on"
            );
        }
    }

    public function test_unknown_declaration_is_rejected_rather_than_returning_empty_text(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        Declarations::textFor('form_ii.no_such_declaration');
    }

    /**
     * Forms II, III, V and VI close the jurisdiction declaration with a full stop; Form IV does not.
     * That is how the Gazette prints them. If someone "fixes" Form IV, this fails.
     *
     * See docs/gazette-divergences.md item E1.
     */
    public function test_form_iv_declaration_is_reproduced_without_its_missing_full_stop(): void
    {
        $this->assertStringEndsWith(
            'jurisdiction of the Rent Authority',
            Declarations::textFor(Declarations::FORM_IV_JURISDICTION)
        );
        $this->assertStringEndsNotWith(
            '.',
            Declarations::textFor(Declarations::FORM_IV_JURISDICTION)
        );

        foreach ([
            Declarations::FORM_II_JURISDICTION,
            Declarations::FORM_III_JURISDICTION,
            Declarations::FORM_V_JURISDICTION,
            Declarations::FORM_VI_JURISDICTION,
        ] as $id) {
            $this->assertStringEndsWith('.', Declarations::textFor($id), "{$id} lost its full stop");
        }
    }

    /**
     * The applicant is shown the browser's copy and the server records its own. If the two ever
     * diverge, a filer would be accepting wording other than what is stored against their name.
     */
    public function test_the_browser_copy_matches_the_recorded_copy(): void
    {
        $this->assertFileExists(self::JS_MIRROR);
        $js = file_get_contents(self::JS_MIRROR);

        foreach (Declarations::text() as $id => $expected) {
            $this->assertStringContainsString(
                $expected,
                $js,
                "frontend/src/constants/declarations.js does not carry the exact wording for {$id}"
            );
        }

        foreach (Declarations::branchText() as $id => $expected) {
            $this->assertStringContainsString(
                $expected,
                $js,
                "frontend/src/constants/declarations.js does not carry the branch wording for {$id}"
            );
        }
    }

    /**
     * Paragraph 5's declaration is the negative limb only. The affirmative branch - what to do when
     * the filer HAS previously filed - is an instruction, not something sworn, so it must never
     * find its way into the snapshot.
     */
    public function test_paragraph_five_snapshot_excludes_the_affirmative_branch(): void
    {
        foreach (Declarations::branchText() as $id => $branch) {
            $sworn = Declarations::textFor($id);

            $this->assertStringStartsWith('The a', $sworn, "{$id} does not read as a declaration");
            $this->assertStringNotContainsString(
                'In case the',
                $sworn,
                "{$id} has absorbed the affirmative branch into the sworn text"
            );
            $this->assertStringContainsString(
                'to be enclosed',
                $branch,
                "{$id} branch text has lost the enclosure requirement"
            );
        }
    }

    /**
     * Forms IV and VI print a semicolon in the branch where Forms II, III and V print a comma.
     * Reproduced as printed. See docs/gazette-divergences.md item E1.
     */
    public function test_branch_punctuation_follows_the_gazette(): void
    {
        foreach ([Declarations::FORM_IV_PRIOR_PROCEEDINGS, Declarations::FORM_VI_PRIOR_PROCEEDINGS] as $id) {
            $this->assertStringContainsString('such cases filed; or if disposed', Declarations::branchTextFor($id));
        }

        foreach ([
            Declarations::FORM_II_PRIOR_PROCEEDINGS,
            Declarations::FORM_III_PRIOR_PROCEEDINGS,
            Declarations::FORM_V_PRIOR_PROCEEDINGS,
        ] as $id) {
            $this->assertStringContainsString('such cases filed, or if disposed', Declarations::branchTextFor($id));
        }
    }

    /**
     * Form IV reads "any other Bench of the any tribunal" where the others read "of the Tribunal".
     * That is a slip in the Gazette, reproduced rather than corrected.
     */
    public function test_form_iv_paragraph_five_keeps_its_printed_wording(): void
    {
        $this->assertStringContainsString(
            'any other Bench of the any tribunal',
            Declarations::textFor(Declarations::FORM_IV_PRIOR_PROCEEDINGS)
        );
    }

    /**
     * The bracket in the Gazette encloses the declaration; the stored text should not carry those
     * parentheses, or a printed form would show them twice.
     *
     * Paragraph 3 of Forms V and VI is excepted, and the reason is a Gazette slip rather than an
     * oversight here: their brackets are never closed. Each opens "(The appellant further
     * declares..." and runs out at "...(Act No XXXI of 2021)" with no closing bracket for the
     * outer one, so the declaration genuinely ends on the inner parenthesis of the Act's citation.
     * Stripping a bracket that is not there would eat the citation. See gazette-divergences E6.
     */
    public function test_declarations_are_stored_without_the_printed_parentheses(): void
    {
        $unclosedInPrint = [
            Declarations::FORM_V_LIMITATION,
            Declarations::FORM_VI_LIMITATION,
        ];

        foreach (Declarations::text() as $id => $text) {
            $this->assertStringStartsNotWith('(', $text, "{$id} keeps its opening bracket");

            if (in_array($id, $unclosedInPrint, true)) {
                $this->assertStringEndsWith(
                    'of 2021)',
                    $text,
                    "{$id} should end on the Act's citation, which is where the Gazette stops"
                );
                continue;
            }

            $this->assertStringEndsNotWith(')', $text, "{$id} keeps its closing bracket");
        }
    }

    /**
     * The two limitation declarations differ from each other in print, in two ways, and both are
     * reproduced. Form VI cites section 38, which does not carry the appeal period - rule 13(1)
     * and s. 37(1) do - and Form V writes "Act No XXXI" where Form VI writes "Act No. XXXI".
     */
    public function test_the_limitation_declarations_reproduce_the_gazettes_own_slips(): void
    {
        $formV = Declarations::textFor(Declarations::FORM_V_LIMITATION);
        $formVI = Declarations::textFor(Declarations::FORM_VI_LIMITATION);

        $this->assertStringContainsString('sub-section (2) of section 32', $formV);
        $this->assertStringContainsString('Act No XXXI of 2021', $formV);

        $this->assertStringContainsString('sub-section (1) of section 38', $formVI);
        $this->assertStringContainsString('Act No. XXXI of 2021', $formVI);
    }
}
