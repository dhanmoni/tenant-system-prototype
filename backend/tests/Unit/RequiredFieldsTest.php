<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

/**
 * Which fields the printed forms make mandatory.
 *
 * The rule the Gazette follows is simple and worth pinning: an item printed WITHOUT an "(if any)"
 * marker is prescribed content, and s. 35(5) of the Act requires an application or appeal to be
 * "in such form as may be prescribed". Items carrying "(if any)" - the Sub-Registrar document
 * number, the property manager, paragraph 7's interim order - are the only optional ones, plus
 * enclosures, which s. 35(1)(a) makes "if any" except where a rule says otherwise.
 *
 * These tests read the controllers as text rather than exercising HTTP, so they need no database
 * and no request cycle. That is enough to catch the thing that actually goes wrong here: someone
 * relaxing a rule to `nullable` to get a form to submit, and nobody noticing that a paragraph the
 * Gazette prescribes has quietly become optional.
 */
class RequiredFieldsTest extends TestCase
{
    private const CONTROLLERS = __DIR__ . '/../../app/Http/Controllers/';

    private function rulesFor(string $controller): string
    {
        $path = self::CONTROLLERS . $controller . '.php';
        $this->assertFileExists($path);

        $source = file_get_contents($path);
        $start = strpos($source, '$data = $request->validate([');
        $this->assertNotFalse($start, "{$controller} has no validate() call");

        return substr($source, $start, strpos($source, '])', $start) - $start);
    }

    private function assertRequired(string $controller, array $fields): void
    {
        $rules = $this->rulesFor($controller);

        foreach ($fields as $field) {
            $this->assertMatchesRegularExpression(
                "/'" . preg_quote($field, '/') . "' => \[\s*\n?\s*'required'/",
                $rules,
                "{$controller}: {$field} is printed without an \"(if any)\" marker, so it is "
                . 'prescribed content and must be required'
            );
        }
    }

    private function assertOptional(string $controller, array $fields): void
    {
        $rules = $this->rulesFor($controller);

        foreach ($fields as $field) {
            $this->assertMatchesRegularExpression(
                "/'" . preg_quote($field, '/') . "' => \['nullable'/",
                $rules,
                "{$controller}: {$field} is printed with an \"(if any)\" marker, so requiring it "
                . 'would block a filing the form allows'
            );
        }
    }

    /** Forms I and I-A, items 1 to 9 plus the signature block. */
    public function test_rent_revision_forms_follow_the_printed_optionality(): void
    {
        foreach (['RentRevisionApplicationController', 'OtherChargesRevisionApplicationController'] as $controller) {
            $this->assertRequired($controller, [
                'tenancy_uin',
                'landlord_name', 'landlord_address',
                'tenant_name', 'tenant_address',
                'rented_premises_description',
                // Which of the two parties signs decides who the applicant is.
                'signed_by', 'signature_name',
            ]);

            $this->assertOptional($controller, [
                // Item 2: "Document No. ... (if any)".
                'tenancy_agreement_document_no',
                // Item 5: "Name and Address of the Property Manager (if any)".
                'manager_name', 'manager_address',
            ]);
        }
    }

    /** Form I-B is one sentence; every blank in it is printed, so every blank is required. */
    public function test_valuer_appointment_requires_every_blank_in_its_recital(): void
    {
        $this->assertRequired('ValuerAppointmentApplicationController', [
            'tenancy_uin',
            'applicant_name',
            'applicant_relation_type',
            'applicant_relation_target_name',
            'applicant_resident_place',
            'applicant_landlord_or_tenant',
            'premises_situated_address',
            'district',
            'signed_by',
            'signature_name',
        ]);
    }

    /**
     * Paragraphs 1, 3, 4 and 6 of Forms II, III and IV carry no "(if any)" and are the substance of
     * the application. Paragraph 7 does carry it.
     */
    public function test_application_forms_require_their_prescribed_paragraphs(): void
    {
        $this->assertRequired('RentCourtPossessionApplicationController', [
            'particulars_of_application', 'facts_of_case', 'grounds_for_relief', 'relief_sought',
            // Form II prints no respondent block; the tenant named in the recital is the only
            // identification of the party sought to be evicted.
            'tenant_name',
        ]);
        $this->assertOptional('RentCourtPossessionApplicationController', ['interim_order_sought']);

        $this->assertRequired('RentCourtFilingApplicationController', [
            'particulars_of_application', 'facts_of_case', 'grounds_for_relief', 'relief_sought',
            'respondent_name', 'respondent_residential_address',
        ]);
        $this->assertOptional('RentCourtFilingApplicationController', ['interim_order_sought']);

        $this->assertRequired('RentAuthorityFilingApplicationController', [
            'particulars_of_violation', 'facts_of_case', 'grounds_for_relief', 'relief_sought',
            'opposite_party_name', 'opposite_party_residential_address',
        ]);
        $this->assertOptional('RentAuthorityFilingApplicationController', ['interim_order_sought']);
    }

    /** Forms V and VI: paragraph 3 is Limitation and paragraph 4 the Memorandum. */
    public function test_appeal_forms_require_their_prescribed_paragraphs(): void
    {
        foreach (['RentCourtAppealApplicationController', 'RentTribunalAppealApplicationController'] as $controller) {
            $this->assertRequired($controller, [
                'order_particulars_against_which_appeal_made',
                // Paragraph 3 is a declaration, so it is accepted rather than written.
                'limitation_declaration_accepted',
                'memorandum_of_appeal',
                'relief_sought',
            ]);
            $this->assertOptional($controller, ['interim_order_sought']);
        }
    }

    /**
     * Rule 13(3): "Each Memorandum shall be accompanied by the certified copy of the order of the
     * Rent Court appealed against". A Form VI appeal therefore always has at least one enclosure,
     * which is why it alone requires the list. Rule 12 imposes no equivalent on Form V.
     */
    public function test_only_the_tribunal_appeal_requires_a_list_of_enclosures(): void
    {
        $this->assertRequired('RentTribunalAppealApplicationController', ['list_of_enclosures']);

        $this->assertOptional('RentCourtAppealApplicationController', ['list_of_enclosures']);
        $this->assertOptional('RentCourtFilingApplicationController', ['list_of_enclosures']);
        $this->assertOptional('RentAuthorityFilingApplicationController', ['list_of_enclosures']);
        $this->assertOptional('RentCourtPossessionApplicationController', ['enclosures_list']);
    }

    /**
     * Every paragraph whose parenthetical is the answer rather than guidance is accepted, not
     * typed. Paragraph 3 of the appeal forms was the last one still rendered as free text.
     */
    public function test_declaration_paragraphs_are_accepted_rather_than_written(): void
    {
        $declared = [
            'RentCourtPossessionApplicationController' => ['jurisdiction_declaration_accepted'],
            'RentCourtFilingApplicationController' => ['jurisdiction_declaration_accepted'],
            'RentAuthorityFilingApplicationController' => ['jurisdiction_declaration_accepted'],
            'RentCourtAppealApplicationController' => [
                'jurisdiction_declaration_accepted',
                'limitation_declaration_accepted',
            ],
            'RentTribunalAppealApplicationController' => [
                'jurisdiction_declaration_accepted',
                'limitation_declaration_accepted',
            ],
        ];

        foreach ($declared as $controller => $fields) {
            $rules = $this->rulesFor($controller);
            foreach ($fields as $field) {
                $this->assertStringContainsString(
                    "'{$field}' => ['required', 'accepted'],",
                    $rules,
                    "{$controller}: {$field} must be accepted, not written"
                );
            }

            // The free-text field it replaced must be gone, or a filing could carry both.
            $this->assertStringNotContainsString("'limitation' => [", $rules);
        }
    }
}
