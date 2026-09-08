<?php

namespace Tests\Unit;

use App\Constants\ApplicationTypes;
use App\Models\CaseProceeding;
use App\Models\RentCourtAppealApplication;
use App\Models\RentTribunalAppealApplication;
use App\Support\NoticeDocument;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/**
 * The notice a party is served with, and that an officer digitally signs.
 *
 * Two things here are worth a test rather than a reading. The forum named on the document is the
 * authority the notice issues under, and it goes on a signed instrument - getting it wrong is not a
 * display bug. And the set of notice types the controller accepts has to match the set this class
 * can actually render, or a proceeding is recorded that produces no document.
 *
 * No database access: the models are filled in memory and their relations set explicitly.
 */
class NoticeDocumentTest extends TestCase
{
    private function proceeding(string $applicationType, string $noticeType = 'appearance'): CaseProceeding
    {
        return (new CaseProceeding())->forceFill([
            'application_type' => $applicationType,
            'notice_type' => $noticeType,
        ]);
    }

    private function application(string $class, ?string $district = 'Jorhat')
    {
        $application = new $class();
        // setRelation rather than a saved row: reading ->district on an unsaved model would
        // otherwise go to the database, and this suite does not touch one.
        $application->setRelation('district', $district === null ? null : (object) ['name' => $district]);

        return $application;
    }

    public static function forums(): array
    {
        return [
            'Form II, possession' => [ApplicationTypes::RENT_COURT_POSSESSION, 'Rent Court'],
            'Form III, vacant land' => [ApplicationTypes::RENT_COURT_FILING, 'Rent Court'],
            'Form V, appeal to Rent Court' => [ApplicationTypes::RENT_COURT_APPEAL, 'Rent Court'],
            'Form VI, appeal to Rent Tribunal' => [ApplicationTypes::RENT_TRIBUNAL_APPEAL, 'Rent Tribunal'],
            'Form I, rent revision' => [ApplicationTypes::RENT_REVISION, 'Rent Authority'],
            'Form I-A, other charges' => [ApplicationTypes::OTHER_CHARGES_REVISION, 'Rent Authority'],
            'Form I-B, valuer' => [ApplicationTypes::VALUER_APPOINTMENT, 'Rent Authority'],
            'Form IV, to the Rent Authority' => [ApplicationTypes::RENT_AUTHORITY_FILING, 'Rent Authority'],
        ];
    }

    #[DataProvider('forums')]
    public function test_each_form_issues_from_its_own_forum(string $applicationType, string $expected): void
    {
        $model = ApplicationTypes::modelFor($applicationType);
        $authority = NoticeDocument::authority(
            $this->proceeding($applicationType),
            $this->application($model)
        );

        $this->assertSame(
            $expected . ', Jorhat',
            $authority,
            "{$applicationType} issues from the {$expected}, and that is what its notice must say"
        );
    }

    public function test_the_forum_does_not_come_from_form_type(): void
    {
        // NoticeDocumentViewer.jsx read $application->form_type, which ApplicationResource
        // synthesises on the way out but which is not a column - on the model it is null. Porting
        // that check unchanged printed, and would have digitally signed, every Rent Court and Rent
        // Tribunal order as "Rent Authority".
        $application = $this->application(RentTribunalAppealApplication::class);
        $this->assertNull($application->form_type, 'form_type is not a column; this test rests on that');

        $this->assertStringStartsWith(
            'Rent Tribunal',
            NoticeDocument::authority($this->proceeding(ApplicationTypes::RENT_TRIBUNAL_APPEAL), $application)
        );
    }

    public function test_a_missing_district_still_names_the_forum(): void
    {
        $authority = NoticeDocument::authority(
            $this->proceeding(ApplicationTypes::RENT_COURT_APPEAL),
            $this->application(RentCourtAppealApplication::class, null)
        );

        $this->assertSame('Rent Court', $authority);
    }

    public function test_every_accepted_notice_type_can_be_rendered(): void
    {
        // The controller's own validation list. A type it accepts but this class cannot render
        // would be recorded as a proceeding that produces no document and so can never be signed
        // or served.
        $accepted = [
            'appearance',
            'applicant_absent',
            'respondent_absent',
            'adjournment',
            'proceeding_sheet',
            'final_order',
            'ex_parte',
        ];

        foreach ($accepted as $type) {
            $this->assertTrue(
                NoticeDocument::supports($type),
                "{$type} is accepted when a proceeding is recorded but has no template"
            );
            $this->assertNotSame('Notice', NoticeDocument::titleFor($type), "{$type} has no title");
        }
    }

    public function test_an_unknown_notice_type_is_not_renderable(): void
    {
        $this->assertFalse(NoticeDocument::supports('something_else'));
        $this->assertFalse(NoticeDocument::supports(null));
    }

    public function test_the_filename_carries_the_case_number(): void
    {
        $application = $this->application(RentTribunalAppealApplication::class);
        $application->forceFill(['application_no' => 'APP-202609-000123']);

        $this->assertSame(
            'final-order-APP-202609-000123.pdf',
            NoticeDocument::filename(
                $this->proceeding(ApplicationTypes::RENT_TRIBUNAL_APPEAL, 'final_order'),
                $application
            )
        );
    }
}
