<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The VERIFICATION clause of Forms II to VI.
 *
 * These columns are what the form needs in order to be rendered and searched. The sworn record
 * itself lives in filing_attestations, which holds the completed sentence verbatim; these are the
 * working copy of the same values.
 *
 * signature_name already existed and is left alone. It is the name against the signature line at
 * the foot of the form, which is not necessarily the verification's opening blank - the Gazette
 * prints both, and on a filing made by one of several joint applicants they can differ.
 *
 * verified_on is stamped by the server at submission, never supplied by the browser: in an online
 * filing the date of verification is the moment of filing, and a client-supplied date would let a
 * verification be back-dated against the limitation paragraph of Forms V and VI.
 */
return new class extends Migration
{
    /**
     * Forms II, III, IV, V and VI. Forms I, I-A and I-B print no verification clause.
     *
     * The table names count the forms in portal order (the panels are numbered 4 to 8), not in the
     * Gazette's roman numbering. Form II is rent_court_form_4_applications, and so on.
     */
    private const TABLES = [
        'rent_court_form_4_applications',
        'rent_court_form_5_applications',
        'rent_authority_form_6_applications',
        'rent_court_form_7_applications',
        'rent_tribunal_form_8_applications',
    ];

    public function up(): void
    {
        foreach (self::TABLES as $table) {
            if (!Schema::hasTable($table)) {
                continue;
            }

            Schema::table($table, function (Blueprint $blueprint) {
                $blueprint->string('verification_name')->nullable();
                $blueprint->string('verification_relation', 16)->nullable();
                $blueprint->string('verification_relative_name')->nullable();
                $blueprint->unsignedSmallInteger('verification_age')->nullable();
                $blueprint->text('verification_address')->nullable();
                $blueprint->string('verification_place')->nullable();

                // Paragraph numbers, as arrays. Stored structured rather than as the rendered
                // "3 to 7" so the sets stay queryable and a non-contiguous selection survives.
                $blueprint->json('verification_personal_knowledge_paras')->nullable();
                $blueprint->json('verification_legal_advice_paras')->nullable();

                $blueprint->date('verified_on')->nullable();

                // The completed sentence as sworn, duplicated from the attestation row so that
                // printing a filing never depends on joining to it.
                $blueprint->text('verification_statement')->nullable();
            });
        }
    }

    public function down(): void
    {
        foreach (self::TABLES as $table) {
            if (!Schema::hasTable($table)) {
                continue;
            }

            Schema::table($table, function (Blueprint $blueprint) {
                $blueprint->dropColumn([
                    'verification_name',
                    'verification_relation',
                    'verification_relative_name',
                    'verification_age',
                    'verification_address',
                    'verification_place',
                    'verification_personal_knowledge_paras',
                    'verification_legal_advice_paras',
                    'verified_on',
                    'verification_statement',
                ]);
            });
        }
    }
};
