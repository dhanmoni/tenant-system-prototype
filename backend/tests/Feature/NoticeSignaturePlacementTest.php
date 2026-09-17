<?php

namespace Tests\Feature;

use App\Constants\ApplicationTypes;
use App\Models\CaseProceeding;
use App\Models\RentCourtAppealApplication;
use App\Support\NoticeDocument;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * Where the digital signature lands on a rendered notice.
 *
 * The DSC agent is told a page and the top-left corner of its stamp, and only the renderer knows
 * where the sign area above the authority's name ended up. These render real PDFs - Blade and
 * Dompdf, no database - and hold the measurement to the layout.
 *
 * Two layouts. Most notices are signed once and the sign area follows the text. A final order is
 * stamped on every page, and the agent puts every stamp at the one corner it is given, so its sign
 * area is pinned in the bottom margin of the last page, where the earlier pages' stamps land on
 * blank margin.
 *
 * The length sweeps are the point. A fixed fixture only ever tests one page break; stepping the
 * remarks a few lines at a time walks the text across several.
 */
class NoticeSignaturePlacementTest extends TestCase
{
    private const MM = 72 / 25.4;

    /** US Legal, 8.5 x 14 in, in points. */
    private const PAGE_WIDTH = 612.0;

    private const PAGE_HEIGHT = 1008.0;

    /** The stamp the agent drew for the first certificate it signed with, in points. */
    private const STAMP_WIDTH = 257;

    private const STAMP_HEIGHT = 36;

    private function models(string $noticeType, int $remarkLines): array
    {
        $proceeding = (new CaseProceeding())->forceFill([
            'application_type' => ApplicationTypes::RENT_COURT_APPEAL,
            'notice_type' => $noticeType,
            'hearing_date' => '2026-10-01',
            // Short enough never to wrap, so each line is one line of height on the page. None at
            // all leaves the template's own placeholder.
            'remarks' => $remarkLines === 0
                ? ''
                : implode("\n", array_map(fn ($i) => "{$i}. Term recorded.", range(1, $remarkLines))),
        ]);

        $application = new RentCourtAppealApplication();
        // setRelation so that reading ->district does not go to a database this suite does not use.
        $application->setRelation('district', (object) ['name' => 'Jorhat']);

        return [$proceeding, $application];
    }

    private function placementFor(string $noticeType, int $remarkLines = 0): array
    {
        [$pdf, $placement] = NoticeDocument::render(...[...$this->models($noticeType, $remarkLines), false]);
        $this->assertStringStartsWith('%PDF-', $pdf);

        return $placement;
    }

    /**
     * The last page any of the notice's own text is on, leaving out the sign area.
     *
     * A block taken out of the flow can still push Dompdf onto a fresh page and sit there alone; the
     * placement would then agree with itself about a page that carries nothing but a signature.
     */
    private function lastPageOfText(string $noticeType, int $remarkLines): int
    {
        $last = 0;

        $dompdf = new \Dompdf\Dompdf();
        $dompdf->setCallbacks([[
            'event' => 'end_frame',
            'f' => function ($frame, $canvas) use (&$last) {
                if (!$frame->is_text_node() || trim($frame->get_node()->nodeValue) === '') {
                    return;
                }
                for ($parent = $frame->get_parent(); $parent; $parent = $parent->get_parent()) {
                    $node = $parent->get_node();
                    if ($node instanceof \DOMElement && str_contains($node->getAttribute('class'), 'signature-block')) {
                        return;
                    }
                }
                $last = max($last, $canvas->get_page_number());
            },
        ]]);
        $dompdf->loadHtml(NoticeDocument::html(...[...$this->models($noticeType, $remarkLines), false]));
        $dompdf->setPaper('legal');
        $dompdf->render();

        return $last;
    }

    private function assertStampFits(array $placement, string $context): void
    {
        $area = $placement['sign_area'];
        $this->assertNotNull($area, "{$context}: the layout has a sign area");
        $this->assertSame($placement['page_count'], $area['page'], "{$context}: on the last page, with the name");

        // [left, top, right, bottom], from the top left of the page.
        [$left, $top, $right, $bottom] = $area['rect'];

        $this->assertEqualsWithDelta(self::PAGE_WIDTH - 20 * self::MM, $right, 1.0, "{$context}: ends at the right margin, where the name does");
        $this->assertEqualsWithDelta(20 * self::MM, $left, 1.0, "{$context}: spans the text width, so a long name's stamp has room to grow left");
        $this->assertGreaterThanOrEqual(self::STAMP_WIDTH, $right - $left, "{$context}: wide enough for the stamp");
        $this->assertGreaterThanOrEqual(self::STAMP_HEIGHT, $bottom - $top, "{$context}: tall enough for the stamp");
    }

    private function assertFollowsTheText(array $placement, string $context): void
    {
        $this->assertFalse($placement['every_page'], "{$context}: signed once");
        $this->assertStampFits($placement, $context);

        [, $top, , $bottom] = $placement['sign_area']['rect'];
        // A sign area that did not fit is moved whole to a fresh page and sits flush with the top
        // margin; the rect is rounded to two decimals, hence the hundredth of a point.
        $this->assertGreaterThanOrEqual(28 * self::MM - 0.01, $top, "{$context}: below the top margin");
        $this->assertLessThanOrEqual(self::PAGE_HEIGHT - 34 * self::MM, $bottom, "{$context}: inside the text area");
    }

    public static function signedOnce(): array
    {
        return [
            'appearance' => ['appearance'],
            'applicant absent' => ['applicant_absent'],
            'respondent absent' => ['respondent_absent'],
            'adjournment' => ['adjournment'],
            'proceeding sheet' => ['proceeding_sheet'],
            'ex parte' => ['ex_parte'],
        ];
    }

    #[DataProvider('signedOnce')]
    public function test_every_other_notice_is_signed_once_in_its_sign_area(string $noticeType): void
    {
        $this->assertFollowsTheText($this->placementFor($noticeType), $noticeType);
    }

    public function test_the_sign_area_follows_the_name_however_long_the_notice_runs(): void
    {
        $pageCounts = [];
        $tops = [];

        // Four lines is well under the height of the closing block, so some step in the sweep puts a
        // page break inside it. That is the case page-break-inside: avoid exists for.
        foreach (range(0, 140, 4) as $lines) {
            $placement = $this->placementFor('proceeding_sheet', $lines);
            $this->assertFollowsTheText($placement, "{$lines} lines of remarks");

            $pageCounts[] = $placement['page_count'];
            $tops[] = $placement['sign_area']['rect'][1];
        }

        $this->assertGreaterThanOrEqual(3, max($pageCounts), 'The sweep has to cross more than one page break');
        $this->assertGreaterThan(5, count(array_unique($tops)), 'The sign area moves with the text');
    }

    public function test_a_final_order_is_signed_at_the_foot_of_every_page_however_long_it_runs(): void
    {
        $reference = null;
        $pageCounts = [];

        foreach (range(0, 140, 6) as $lines) {
            $placement = $this->placementFor('final_order', $lines);
            $context = "final order, {$lines} lines of remarks";

            $this->assertTrue($placement['every_page'], "{$context}: stamped on every page");
            $this->assertStampFits($placement, $context);
            $this->assertSame(
                $this->lastPageOfText('final_order', $lines),
                $placement['page_count'],
                "{$context}: the sign area did not push the order onto a page of its own"
            );

            // One corner serves every page, so it cannot depend on where the text ended.
            $reference ??= $placement['sign_area']['rect'];
            $this->assertSame($reference, $placement['sign_area']['rect'], "{$context}: pinned, not following the text");

            $pageCounts[] = $placement['page_count'];
        }

        $this->assertGreaterThanOrEqual(3, max($pageCounts), 'The sweep has to run the order over several pages');

        [, $top, , $bottom] = $reference;
        $this->assertGreaterThanOrEqual(
            self::PAGE_HEIGHT - 54 * self::MM,
            $top,
            'In the bottom margin, so the stamp on each earlier page covers no text'
        );
        $this->assertLessThanOrEqual(
            self::PAGE_HEIGHT - 25 * self::MM,
            $bottom,
            'With room beneath for the name before the edge of the paper'
        );
    }
}
