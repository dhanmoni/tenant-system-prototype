<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Paragraph 5 of Forms II to VI - "Matters not previously filed or pending with any other court".
 *
 * The paragraph is a negative declaration with an affirmative branch. The filer either declares
 * that no such proceeding was filed or is pending, or, if one was, the form requires "the details
 * of the pendency of such cases filed, or if disposed, the decisions of such cases to be enclosed".
 * A single textarea cannot express that: it collects prose where the form asks for a yes/no and,
 * on yes, a structured list.
 *
 * The declaration itself, when made, is recorded in filing_attestations. These columns hold the
 * branch: whether there are prior proceedings, and their particulars when there are.
 *
 * Additive and nullable, so filings submitted before this migration remain readable. The existing
 * matters_not_previously_filed* text columns are kept and still populated.
 */
return new class extends Migration
{
    private const TABLES = [
        'rent_court_form_4_applications' => 'matters_not_previously_filed',
        'rent_court_form_5_applications' => 'matters_not_previously_filed_or_pending',
        'rent_authority_form_6_applications' => 'matters_not_previously_filed_or_pending',
        'rent_court_form_7_applications' => 'matters_not_previously_filed_or_pending',
        'rent_tribunal_form_8_applications' => 'matters_not_previously_filed_or_pending',
    ];

    public function up(): void
    {
        foreach (self::TABLES as $table => $after) {
            Schema::table($table, function (Blueprint $blueprint) use ($after) {
                $blueprint->boolean('has_prior_proceedings')->nullable()->after($after);
                $blueprint->json('prior_proceedings')->nullable()->after('has_prior_proceedings');
            });
        }
    }

    public function down(): void
    {
        foreach (array_keys(self::TABLES) as $table) {
            Schema::table($table, function (Blueprint $blueprint) {
                $blueprint->dropColumn(['has_prior_proceedings', 'prior_proceedings']);
            });
        }
    }
};
